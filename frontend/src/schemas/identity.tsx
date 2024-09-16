import * as z from "zod";
import { useTranslations } from "next-intl";

export const signupSchema = (t: ReturnType<typeof useTranslations>) => {
  return z.object({
    email: z
      .string()
      .email(t("errors.FIELD_IS_INVALID", { field: "email address" })),
    password: z.string().min(8),
  });
};
