import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";
import { listSaved } from "@/lib/store";

export const GET = withAuthErrors(async (request: NextRequest) => {
  const user = await getAuthorizedUser(request);
  const listings = await listSaved(user.uid);
  return NextResponse.json({ listings });
});
