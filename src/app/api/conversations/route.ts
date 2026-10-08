import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { listConversations } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = await getAuthorizedUser(request);
  const conversations = await listConversations(user.uid);
  return NextResponse.json({ conversations });
}
