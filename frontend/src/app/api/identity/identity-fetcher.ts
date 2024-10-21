import { ApiResponse } from "@/types/api";
import { ApiExceptionHandler, getDefaultApiHeader } from "@/utils/utils";

type VerifyTokenProps = string | undefined;

interface PasswordResetProps {
  token: string;
  password: string;
  password_confirmation: string;
}

export async function verifyToken(
  token: VerifyTokenProps
): Promise<ApiResponse> {
  try {
    const request = await fetch(
      process.env.API_BASE_URL + "/identity/verification/email",
      {
        method: "PATCH",
        headers: getDefaultApiHeader(),
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

// ********** FORGOT PASSWORD FETCHER ********** //
export async function forgotPassword(email: string): Promise<ApiResponse> {
  try {
    const request = await fetch(
      process.env.API_BASE_URL + "/identity/forgot-password",
      {
        method: "POST",
        headers: getDefaultApiHeader(),
        body: JSON.stringify({
          email,
        }),
      }
    );

    return await request.json();
  } catch (error: any) {
    return ApiExceptionHandler(error.message);
  }
}

// ********** VERIFY PASSWORD RESET TOKEN FETCHER ********** //
export async function verifyPasswordResetToken(
  token: string | undefined
): Promise<ApiResponse> {
  try {
    const request = await fetch(
      process.env.API_BASE_URL + "/identity/verification/password-reset",
      {
        method: "POST",
        headers: getDefaultApiHeader(),
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

// ********** RESET PASSWORD FETCHER ********** //
export async function passwordReset({
  token,
  password,
  password_confirmation,
}: PasswordResetProps): Promise<ApiResponse> {
  try {
    const request = await fetch(
      process.env.API_BASE_URL + "/identity/password-reset",
      {
        method: "POST",
        headers: getDefaultApiHeader(),
        body: JSON.stringify({
          token,
          password,
          password_confirmation,
        }),
      }
    );

    return await request.json();
  } catch (error: any) {
    return ApiExceptionHandler(error.message);
  }
}
