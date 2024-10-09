import { ApiResponse } from "@/types/api";
import { ApiExceptionHandler } from "@/utils/utils";

type VerifyTokenProps = string | undefined;

export async function verifyToken(
  token: VerifyTokenProps
): Promise<ApiResponse> {
  try {
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
  } catch (error: any) {
    return ApiExceptionHandler(error.message);
  }
}
