import { NextRequest, NextResponse } from "next/server";
import { assertOwner } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { getListingById, upsertListing } from "@/lib/store";

export const POST = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await assertOwner(request, listing.sellerId);
  const updated = { ...listing, status: "sold" as const, updatedAt: new Date().toISOString() };
  await upsertListing(updated);
  return NextResponse.json({ listing: updated });
});
