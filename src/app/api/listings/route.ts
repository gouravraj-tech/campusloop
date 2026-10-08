import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { listingSchema } from "@/lib/schemas";
import { listListings, upsertListing } from "@/lib/store";

export async function GET(request: NextRequest) {
  const search = new URL(request.url).searchParams.get("q") ?? "";
  const listings = await listListings();
  const filtered = listings.filter((listing) => {
    const haystack = `${listing.title} ${listing.description} ${listing.searchText ?? ""}`.toLowerCase();
    return !search || haystack.includes(search.toLowerCase());
  });

  return NextResponse.json({ listings: filtered });
}

export const POST = withAuthErrors(async (request: NextRequest) => {
  const user = await getAuthorizedUser(request);
  const body = await request.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid listing data." }, { status: 400 });
  }

  const listing = {
    id: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    price: Number(parsed.data.price),
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickupLocation: parsed.data.pickupLocation,
    imageUrl: parsed.data.imageUrl,
    status: parsed.data.status ?? "available",
    sellerId: user.uid,
    sellerName: user.name,
    college: user.college,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    searchText: `${parsed.data.title} ${parsed.data.description}`.toLowerCase(),
    book: parsed.data.isbn
      ? {
          isbn: parsed.data.isbn,
          title: parsed.data.title,
        }
      : undefined,
  };

  await upsertListing(listing);
  return NextResponse.json({ listing }, { status: 201 });
});
