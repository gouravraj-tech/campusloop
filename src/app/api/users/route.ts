import { NextRequest, NextResponse } from "next/server";
import type { DecodedIdToken, UserRecord } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getUserFromToken } from "@/lib/auth";
import { createUser, getUserByEmail, getUserByUid } from "@/lib/store";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user;
  try {
    user = await getUserFromToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = { ...user };
  delete profile.token;
  return NextResponse.json({ user: profile });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    college?: string;
  };

  const email = String(payload.email ?? "").trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const name = String(payload.name ?? "Campus Student").trim() || "Campus Student";
  const college = String(payload.college ?? "Campus University").trim() || "Campus University";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    if (!token) {
      return NextResponse.json({ error: "A Firebase sign-in is required." }, { status: 401 });
    }

    let identity: DecodedIdToken;
    let firebaseUser: UserRecord;
    try {
      identity = await adminAuth.verifyIdToken(token);
      firebaseUser = await adminAuth.getUser(identity.uid);
    } catch {
      return NextResponse.json({ error: "Unable to verify the Firebase account." }, { status: 401 });
    }

    const verifiedEmail = firebaseUser.email?.trim();
    if (!verifiedEmail || verifiedEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "The signed-in account email does not match." }, { status: 403 });
    }

    const existing = await getUserByUid(identity.uid);
    const user = existing ?? await createUser({
      uid: identity.uid,
      name: firebaseUser.displayName?.trim() || name,
      email: verifiedEmail,
      college,
    });
    const profile = { ...user };
    delete profile.token;
    return NextResponse.json({ user: profile }, { status: existing ? 200 : 201 });
  }

  if (token) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on the server." },
      { status: 503 },
    );
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ user: existing });
  }

  const user = await createUser({
    name,
    email,
    college,
    token: `campusloop-${crypto.randomUUID()}`,
  });

  return NextResponse.json({ user }, { status: 201 });
}
