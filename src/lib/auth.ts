import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getUserByToken, getUserByUid } from "@/lib/store";

export async function getUserFromToken(token: string) {
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return getUserByUid(decodedToken.uid);
  }

  return getUserByToken(token);
}

export async function getAuthorizedUser(request: NextRequest) {
  const raw = request.headers.get("authorization") ?? "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : null;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const user = await getUserFromToken(token);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function assertOwner(request: NextRequest, sellerId: string) {
  const user = await getAuthorizedUser(request);
  if (user.uid !== sellerId) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function assertParticipant(request: NextRequest, buyerId: string, sellerId: string) {
  const user = await getAuthorizedUser(request);
  if (user.uid !== buyerId && user.uid !== sellerId) {
    throw new Error("Forbidden");
  }
  return user;
}
