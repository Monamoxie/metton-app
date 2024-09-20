"use server";
import { signupSchema } from "@/schemas/identity";
import * as z from "zod";

type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;

export async function signupAction(data: SignupInputs) {
  const { email, password, password_conf } = data;

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

  return await response.json();
}
