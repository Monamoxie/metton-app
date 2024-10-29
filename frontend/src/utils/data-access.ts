import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const verifyToken = cache(async () => {
  const token = (await cookies()).get("bearer_token")?.value;

  if (!token) {
    redirect("/login");
  }

  return { isAuth: true, token };
});

export const storeToken = async (token: string, expiry: string) => {
  const expiresAt = new Date(expiry);
  await cookies().set("bearer_token", token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return true;
};
