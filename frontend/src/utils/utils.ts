import { ApiResponse, AuthApiHeaderResponse } from "@/types/api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LocalApiRequestProps } from "@/types/api";
import * as AuthService from "@/services/auth-service";

// todo ::: @depreciated
// to migrate all these functions into core utils

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ApiExceptionHandler(message: string): ApiResponse {
  return {
    message: message || "An error occurred",
    data: null,
    errors: { generic: [message] },
    code: 500,
  };
}

export function getDefaultApiHeader(): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store,max-age=0",
  };
}

// -- // --
export function getAuthApiHeader(): Record<string, string> {
  return {
    ...(getDefaultApiHeader() as AuthApiHeaderResponse),
    Authorization: `Token ${AuthService.getBearerToken()}`,
  };
}

export async function localApiRequest<T>({
  url,
  method,
  body,
  setProcessing,
  setResponseErrors,
  setIsFinished,
  setMessage,
}: LocalApiRequestProps): Promise<T | null | void> {
  setProcessing(true);

  try {
    const request = await fetch(url, {
      method,
      headers: getDefaultApiHeader(),
      body: body ? JSON.stringify(body) : null,
    });

    const response = await request.json();
    setProcessing(false);

    if (response.code !== 200) {
      return setResponseErrors(response.errors);
    }

    setIsFinished(true);
    if (setMessage && response.message) {
      return setMessage(response.message);
    }
  } catch (error) {
    setProcessing(false);
    return setResponseErrors({ generic: ["Network error"] });
  }
}

export function getUserPublicProfileUrl(
  public_id: string,
  base_url: string | null
) {
  return base_url + "/meet/" + public_id;
}
