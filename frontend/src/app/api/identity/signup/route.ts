import { NextResponse } from "next/server";
import { setCookie } from "cookies-next";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, password_conf } = body;

    const response = await fetch("http://nginx:80/api/v1/identity/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password1: password,
        password2: password_conf,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { errors: { generic: error.message } },
      { status: 500 }
    );
  }
}
