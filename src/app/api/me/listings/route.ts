import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { listListings } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = await getAuthorizedUser(request);
  const listings = await listListings();
  return NextResponse.json({
    listings: listings.filter((listing) => listing.sellerId === user.uid),
  });
}
