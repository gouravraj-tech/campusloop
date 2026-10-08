import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, getUserByToken } from "@/lib/store";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
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
