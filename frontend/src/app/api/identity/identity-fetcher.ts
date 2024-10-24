import { ApiResponse, VerifyTokenProps, PasswordResetProps } from "@/types/api";
import { SignupInputs } from "@/types/identity";
import { ApiExceptionHandler, getDefaultApiHeader } from "@/utils/utils";

//********** SIGN UP ********** //
export async function signup({
  email,
  password1,
  password2,
}: SignupInputs): Promise<ApiResponse> {
  try {
    const request = await fetch(process.env.API_BASE_URL + "/identity/signup", {
      method: "POST",
      headers: getDefaultApiHeader(),
      body: JSON.stringify({
        email,
        password1,
        password2,
      }),
    });

    return await request.json();
  } catch (error: any) {
    return ApiExceptionHandler(error.message);
  }
}

// ********** VERIFY EMAIL ********** //
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

// ********** FORGOT PASSWORD ********** //
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

// ********** VERIFY PASSWORD RESET TOKEN ********** //
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

// **********  PASSWORD RESET ********** //
export async function passwordReset({
  token,
  password,
  password_confirmation,
}: PasswordResetProps): Promise<ApiResponse> {
  try {
    const request = await fetch(
      process.env.API_BASE_URL + "/identity/password-reset",
      {
        method: "PATCH",
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
