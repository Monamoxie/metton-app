import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const verifyToken = cache(async () => {
  const token = (await cookies()).get("bearer_token")?.value;

  if (!token) {
    redirect("/identity/signin");
  }

  return { isAuth: true, token };
});

export const storeToken = async (token: string, expiry: string) => {
  await cookies().set("bearer_token", token, {
    httpOnly: true,
    secure: true,
    expires: new Date(expiry),
    sameSite: "lax",
    path: "/",
  });

  return true;
};
