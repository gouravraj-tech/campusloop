import { NextRequest } from "next/server";
import { getUserByToken } from "@/lib/store";

export async function getAuthorizedUser(request: NextRequest) {
  const raw = request.headers.get("authorization") ?? "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : null;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const user = await getUserByToken(token);

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
