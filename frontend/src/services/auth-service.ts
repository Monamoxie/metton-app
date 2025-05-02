import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import {
  SigninInputs,
  SignupInputs,
  UserToken,
  UserProfile,
  ForgotPasswordInputs,
  PasswordResetInput,
} from "@/types/identity";
import { authStore } from "@/stores/auth-store";

// --- Create Account ---
export const createAccount = async (
  payload: SignupInputs
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post("/identity/signup", payload, {
      headers: Utils.getDefaultApiHeader(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- // --
export const verifyEmailToken = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.patch(
      "/identity/verification/email",
      {
        token,
      },
      {
        headers: Utils.getDefaultApiHeader(),
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- Sign In --
export const signIn = async (payload: SigninInputs): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post("/identity/signin", payload, {
      headers: Utils.getDefaultApiHeader(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- Store token and user basic info --
export const persistUserSession = async (
  token: UserToken,
  user: UserProfile,
  rememberMe: boolean = false
) => {
  const auth = authStore.getState();
  await auth.setAuth(token, user, rememberMe);
  return true;
};

// -- Clear token and user's basic info --
export const clearUserSession = async () => {
  const auth = authStore.getState();
  await auth.clearAuth();
};

// -- // --
export const isAuthenticated = (): boolean => {
  const { token, user } = authStore.getState();
  return !!token?.token && !!user && !isTokenExpired(token);
};

// -- // --
export const getBearerToken = (): string => {
  const { token } = authStore.getState();
  return token?.token || "";
};

// -- // --
export const isTokenExpired = (token: UserToken | null): boolean => {
  if (!token?.expiry) return true;
  return new Date(token.expiry).getTime() <= Date.now();
};

// -- // --
export const requestPasswordReset = async (
  payload: ForgotPasswordInputs
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      "/identity/forgot-password",
      payload,
      {
        headers: Utils.getDefaultApiHeader(),
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- // --
export const verifyPasswordResetToken = async (
  token: string
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.post(
      "/identity/verification/password-reset",
      {
        token,
      },
      {
        headers: Utils.getDefaultApiHeader(),
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};

// -- // --
export const passwordReset = async (
  token: string,
  data: PasswordResetInput
): Promise<ApiResponse> => {
  try {
    const response = await axiosClient.patch(
      "/identity/password-reset",
      {
        token,
        ...data,
      },
      {
        headers: Utils.getDefaultApiHeader(),
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return Utils.ApiExceptionHandler(error.message);
  }
};
