import { NextRequest, NextResponse } from "next/server";
import { assertOwner } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { getListingById, upsertListing, deleteListing } from "@/lib/store";
import { listingSchema } from "@/lib/schemas";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export const PATCH = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await assertOwner(request, listing.sellerId);
  const body = await request.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid listing data." }, { status: 400 });
  }

  const updated: typeof listing = {
    ...listing,
    title: parsed.data.title,
    description: parsed.data.description,
    price: Number(parsed.data.price),
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickupLocation: parsed.data.pickupLocation,
    imageUrl: parsed.data.imageUrl,
    status: parsed.data.status ?? listing.status,
    updatedAt: new Date().toISOString(),
    searchText: `${parsed.data.title} ${parsed.data.description}`.toLowerCase(),
    book: parsed.data.isbn ? { isbn: parsed.data.isbn, title: parsed.data.title } : listing.book,
  };

  await upsertListing(updated);
  return NextResponse.json({ listing: updated, user: { uid: user.uid, name: user.name } });
});

export const DELETE = withAuthErrors(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const listing = await getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await assertOwner(request, listing.sellerId);
  await deleteListing(id);
  return NextResponse.json({ success: true });
});
