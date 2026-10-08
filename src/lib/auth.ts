import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getUserByToken, getUserByUid } from "@/lib/store";

export class ApiAuthError extends Error {
  constructor(message: string, readonly status: 401 | 403) {
    super(message);
    this.name = "ApiAuthError";
  }
}

export async function getUserFromToken(token: string) {
  const adminAuth = getAdminAuth();

  if (adminAuth) {
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      throw new ApiAuthError("Unauthorized", 401);
    }
    return getUserByUid(decodedToken.uid);
  }

  return getUserByToken(token);
}

export async function getAuthorizedUser(request: NextRequest) {
  const raw = request.headers.get("authorization") ?? "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : null;

  if (!token) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  const user = await getUserFromToken(token);

  if (!user) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  return user;
}

export async function assertOwner(request: NextRequest, sellerId: string) {
  const user = await getAuthorizedUser(request);
  if (user.uid !== sellerId) {
    throw new ApiAuthError("Forbidden", 403);
  }
  return user;
}

export async function assertParticipant(request: NextRequest, buyerId: string, sellerId: string) {
  const user = await getAuthorizedUser(request);
  if (user.uid !== buyerId && user.uid !== sellerId) {
    throw new ApiAuthError("Forbidden", 403);
  }
  return user;
}
