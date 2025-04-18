import axiosClient from "@/utils/axios-client";
import { ApiResponse } from "@/types/api";
import * as Utils from "@/utils/utils";
import {
  SigninInputs,
  SignupInputs,
  UserToken,
  UserProfile,
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
export const createUserStore = (
  token: UserToken,
  user: UserProfile,
  rememberMe: boolean = false
) => {
  const auth = authStore.getState();
  auth.setAuth(token, user, rememberMe);
};

// -- Clear token and user's basic info --
export const clearUserStore = () => {
  const auth = authStore.getState();
  auth.clearAuth();
};

// -- // --
export const isAuthenticated = (): boolean => {
  const { token, user } = authStore.getState();
  return !!token?.token && !!user && !isTokenExpired(token);
};

// -- // --
export const isTokenExpired = (token: UserToken | null): boolean => {
  if (!token?.expiry) return true;
  return new Date(token.expiry).getTime() <= Date.now();
};
