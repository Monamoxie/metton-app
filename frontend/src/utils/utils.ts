import { ApiResponse } from "@/types/api";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
