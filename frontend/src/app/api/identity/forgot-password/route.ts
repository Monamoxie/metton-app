import { NextResponse } from "next/server";
import { forgotPassword } from "@/data/outbound/identity-fetcher";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  const response = await forgotPassword(email);

  return NextResponse.json(response);
}
