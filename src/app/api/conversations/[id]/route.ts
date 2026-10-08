import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser, assertParticipant } from "@/lib/auth";
import { getConversationById } from "@/lib/store";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getAuthorizedUser(request);
  const conversation = await getConversationById(id);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await assertParticipant(request, conversation.buyerId, conversation.sellerId);
  return NextResponse.json({ conversation, user });
}
