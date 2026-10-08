import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedUser } from "@/lib/auth";
import { withAuthErrors } from "@/lib/api-route";

export const POST = withAuthErrors(async (request: NextRequest) => {
  await getAuthorizedUser(request);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Photo uploads are not configured yet." }, { status: 503 });
  }

  const parameters = {
    folder: "campusloop/listings",
    overwrite: "false",
    public_id: randomUUID(),
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };
  const signatureBase = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    signature,
    ...parameters,
  });
});
