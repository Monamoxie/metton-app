import {
  profileUpdateSchema,
  signInSchema,
  signupSchema,
  forgotPasswordSchema,
  passwordResetSchema,
} from "@/schemas/identity-schemas";
import * as z from "zod";

export type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;

export type SigninInputs = z.infer<ReturnType<typeof signInSchema>>;

export type ForgotPasswordInputs = z.infer<
  ReturnType<typeof forgotPasswordSchema>
>;

export type PasswordResetInput = z.infer<
  ReturnType<typeof passwordResetSchema>
>;

export type ProfileUpdateInputs = z.infer<
  ReturnType<typeof profileUpdateSchema>
>;

export interface UserToken {
  token: string | null;
  expiry: Date | null;
}

export interface UserProfile {
  public_id: string;
  email: string;
  name: null | string;
  is_active: boolean;
  position: null | string;
  company: null | string;
  profile_summary: null | string;
  profile_photo: null | string;
  date_joined: Date;
  email_verified: boolean;
}

export interface UserProfileCardProps {
  user: UserProfile;
  base_url: string | null;
}