import { NextResponse } from "next/server";
import { passwordReset } from "@/data/outbound/identity-fetcher";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, password, password_confirmation } = body;

  const response = await passwordReset({
    token,
    password,
    password_confirmation,
  });

  return NextResponse.json(response);
}
