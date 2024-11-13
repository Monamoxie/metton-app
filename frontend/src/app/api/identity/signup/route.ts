import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";
import { SignupInputs } from "@/types/identity";
import { signup } from "@/data/outbound/identity-fetcher";

export async function POST(request: Request) {
  const body: SignupInputs = await request.json();
  const { email, password1, password2 } = body;

  const response = await signup({
    email,
    password1,
    password2,
  });

  return NextResponse.json(response);
}
