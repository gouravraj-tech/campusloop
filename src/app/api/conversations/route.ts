import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { listConversations } from "@/lib/store";

export const GET = withAuthErrors(async (request: NextRequest) => {
  const user = await getAuthorizedUser(request);
  const conversations = await listConversations(user.uid);
  return NextResponse.json({ conversations });
});
