import { NextResponse } from "next/server";
import { newPasswordRequest } from "@/app/api/identity/identity-fetcher";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  const response = await newPasswordRequest(email);

  return NextResponse.json(response);
}
