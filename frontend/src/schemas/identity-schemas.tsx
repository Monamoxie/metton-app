import * as z from "zod";
import { useTranslations } from "next-intl";

// ************ SIGN UP SCHEMA ****************/
export const signupSchema = (t: ReturnType<typeof useTranslations>) => {
  return z
    .object({
      email: z
        .string()
        .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
      password1: z
        .string()
        .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
      password2: z.string(),
    })
    .refine((data) => data.password1 === data.password2, {
      message: t("errors.DATA_DO_NOT_MATCH", { data: "Passwords" }),
      path: ["password2"],
    });
};

// ************ SIGN IN SCHEMA ****************/
export const signInSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    email: z
      .string()
      .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
    password: z
      .string()
      .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
  });
};

// ************ FORGOT PASSWORD SCHEMA ****************/
export const forgotPasswordSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    email: z
      .string()
      .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
  });
};

// ************ PASSWORD RESET SCHEMA ****************/
export const passwordResetSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    password: z
      .string()
      .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
    password_confirmation: z.string(),
  });
};
