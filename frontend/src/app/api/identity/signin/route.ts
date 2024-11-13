import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";
import { SigninInputs } from "@/types/identity";
import { signin } from "@/data/outbound/identity-fetcher";

export async function POST(request: Request) {
  const body: SigninInputs = await request.json();
  const { email, password, remember_me } = body;

  const response = await signin({
    email,
    password,
    remember_me,
  });

  return NextResponse.json(response);
}
