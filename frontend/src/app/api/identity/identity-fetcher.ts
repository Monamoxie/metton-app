import ApiResponse from "@/types/api";

type VerifyTokenProps = string | undefined;

export async function verifyToken(
  token: VerifyTokenProps
): Promise<ApiResponse> {
  const request = await fetch(
    process.env.API_BASE_URL + "/identity/verification/email",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    }
  );

  return await request.json();
}
