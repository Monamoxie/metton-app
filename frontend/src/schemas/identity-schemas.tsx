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
      source: z.string().optional(),
      recaptcha: z.string().optional(),
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
    remember_me: z.boolean().optional(),
    source: z.string().optional(),
    recaptcha: z.string().optional(),
  });
};

// ************ FORGOT PASSWORD SCHEMA ****************/
export const forgotPasswordSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    email: z
      .string()
      .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
    source: z.string().optional(),
    recaptcha: z.string().optional(),
  });
};

// ************ PASSWORD RESET SCHEMA ****************/
export const passwordResetSchema = (t: ReturnType<typeof useTranslations>) => {
  return z
    .object({
      password: z
        .string()
        .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
      password_confirmation: z.string(),
      source: z.string().optional(),
      recaptcha: z.string().optional(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t("errors.DATA_DO_NOT_MATCH", { data: "Passwords" }),
      path: ["password_confirmation"],
    });
};

// ************ PROFILE UPDATE ****************/
export const profileUpdateSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    name: z.string().min(1, t("errors.FIELD_IS_INVALID", { field: "Name" })),
    company: z.string().optional(),
    position: z.string().optional(),
    profile_summary: z.string().optional(),
    profile_photo: z.string().optional(),
    remove_profile_photo: z.string().optional(),
  });
};

// ************ PASSWORD UPDATE ****************/
export const passwordUpdateSchema = (t: ReturnType<typeof useTranslations>) => {
  return z
    .object({
      current_password: z.string(),
      new_password: z
        .string()
        .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
      confirm_new_password: z.string().min(
        8,
        t("errors.FIELD_MINIMUM_CHARS", {
          field: "Password Confirmation",
          min: 8,
        })
      ),
    })
    .refine((data) => data.new_password === data.confirm_new_password, {
      message: t("errors.DATA_DO_NOT_MATCH", { data: "Passwords" }),
      path: ["confirm_new_password"],
    });
};
