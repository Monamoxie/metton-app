import { signInSchema, signupSchema } from "@/schemas/identity-schemas";
import * as z from "zod";

export type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;

export type SigninInputs = z.infer<ReturnType<typeof signInSchema>>;

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
  height_field: null | Integer;
  width_field: null | Integer;
}
