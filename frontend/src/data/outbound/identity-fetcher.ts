import { ApiResponse, VerifyTokenProps, PasswordResetProps } from "@/types/api";
import { ApiExceptionHandler, getDefaultApiHeader } from "@/utils/utils";
import "server-only";
import { getAuthApiHeader, storeToken } from "@/data/cookie";
import api from "@/utils/axios-client";

// ********** GET USER PROFILE ********** //
export async function getUserProfile(): Promise<ApiResponse> {
  try {
    const response = await api.get("/identity/user/profile", {
      headers: await getAuthApiHeader(),
    });

    return response.data;
  } catch (error: any) {
    return ApiExceptionHandler(error.message);
  }
}
