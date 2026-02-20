import { NextResponse } from "next/server";
import * as Cookie from "@/data/cookie";

export async function POST(request: Request) {
  const { token, expiry } = await request.json();
  await Cookie.storeToken(token, expiry);

  return NextResponse.json({ success: true });
}
