import * as z from "zod";
import { useTranslations } from "next-intl";

export const signupSchema = (t: ReturnType<typeof useTranslations>) => {
  return z
    .object({
      email: z
        .string()
        .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
      password: z
        .string()
        .min(8, t("errors.FIELD_MINIMUM_CHARS", { field: "Password", min: 8 })),
      password_conf: z.string(),
    })
    .refine((data) => data.password === data.password_conf, {
      message: t("errors.DATA_DO_NOT_MATCH", { data: "Passwords" }),
      path: ["password_conf"],
    });
};
