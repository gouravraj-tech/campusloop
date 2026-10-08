import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { listSaved } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = await getAuthorizedUser(request);
  const listings = await listSaved(user.uid);
  return NextResponse.json({ listings });
}
