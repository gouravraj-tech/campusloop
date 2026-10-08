import { NextRequest, NextResponse } from "next/server";
import { assertParticipant, getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { messageSchema } from "@/lib/schemas";
import { appendMessage, getConversationById } from "@/lib/store";

export const POST = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const user = await getAuthorizedUser(request);
  const conversation = await getConversationById(id);

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await assertParticipant(request, conversation.buyerId, conversation.sellerId);
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
  }

  const updated = await appendMessage(conversation.id, {
    id: crypto.randomUUID(),
    senderId: user.uid,
    text: parsed.data.text,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ conversation: updated });
});
