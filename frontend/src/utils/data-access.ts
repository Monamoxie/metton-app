import "server-only";

import { cookies } from "next/headers";
import { getDefaultApiHeader } from "./utils";

export const verifyToken = async () => {
  const token = (await cookies()).get("bearer_token")?.value;

  return !!token;
};

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

export const getToken = async (): Promise<string> => {
  return (await cookies()).get("bearer_token")?.value || "";
};

export async function getAuthApiHeader(): Promise<HeadersInit> {
  const authToken = await getToken();

  if (!authToken) {
    throw new Error("No authentication token found");
  }

  return {
    ...getDefaultApiHeader(),
    Authorization: `Bearer ${authToken}`,
  };
}
