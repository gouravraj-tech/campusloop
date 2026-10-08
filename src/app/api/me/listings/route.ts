import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { listListings } from "@/lib/store";

export const GET = withAuthErrors(async (request: NextRequest) => {
  const user = await getAuthorizedUser(request);
  const listings = await listListings();
  return NextResponse.json({
    listings: listings.filter((listing) => listing.sellerId === user.uid),
  });
});
