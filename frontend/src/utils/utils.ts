import { ApiResponse } from "@/types/api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dispatch, SetStateAction } from "react";

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

export function getDefaultApiHeader(): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-store,max-age=0",
  };
}

type Method = "POST" | "GET" | "PATCH" | "PUT" | "DELETE";
interface localApiRequestProps {
  url: string;
  method: Method;
  body: object | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponseErrors: Dispatch<SetStateAction<{ [key: string]: string[] }>>;
  setIsFinished: Dispatch<SetStateAction<boolean>>;
  setMessage?: Dispatch<SetStateAction<string>>;
}

export async function localApiRequest<T>({
  url,
  method,
  body,
  setProcessing,
  setResponseErrors,
  setIsFinished,
  setMessage,
}: localApiRequestProps): Promise<T | null | void> {
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
