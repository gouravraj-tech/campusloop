import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { getListingById, saveListingForUser, unsaveListingForUser } from "@/lib/store";

export const POST = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const user = await getAuthorizedUser(request);
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await saveListingForUser(user.uid, listing.id);
  return NextResponse.json({ saved: true, listing });
});

export const DELETE = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const user = await getAuthorizedUser(request);
  await unsaveListingForUser(user.uid, id);
  return NextResponse.json({ success: true });
});
