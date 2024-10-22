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
    "Cache-Control": "no-store, max-age=0",
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
}: localApiRequestProps): Promise<T | null> {
  setProcessing(true);
  console.log(body);

  try {
    const response = await fetch(url, {
      method,
      headers: getDefaultApiHeader(),
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();
    setProcessing(false);

    if (response.ok) {
      setIsFinished(true);
      if (setMessage && data.message) {
        setMessage(data.message);
      }
      return data;
    }

    setResponseErrors(
      data.errors || {
        generic: [
          "Something went wrong. Could not contact the outbound server",
        ],
      }
    );
    return null;
  } catch (error) {
    setProcessing(false);
    console.log(error);
    setResponseErrors({ generic: ["Network error"] });
    return null;
  }
}
