import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("bearer_token");
  return NextResponse.json({ success: true });
}
