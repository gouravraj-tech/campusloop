import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { messageSchema } from "@/lib/schemas";
import { appendMessage, createOrGetConversation, getListingById } from "@/lib/store";

export const POST = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const user = await getAuthorizedUser(request);
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.uid === listing.sellerId) {
    return NextResponse.json({ error: "You cannot message yourself about your listing." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const conversationId = `${listing.id}_${user.uid}`;
  const conversation = await createOrGetConversation({
    id: conversationId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImageUrl: listing.imageUrl,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    buyerId: user.uid,
    buyerName: user.name,
    lastMessage: parsed.data.text,
    lastMessageAt: now,
    createdAt: now,
    unreadFor: listing.sellerId,
    messages: [],
  });

  const message = {
    id: crypto.randomUUID(),
    senderId: user.uid,
    text: parsed.data.text,
    createdAt: now,
  };

  const updated = await appendMessage(conversation.id, message);
  return NextResponse.json({ conversation: updated });
});
