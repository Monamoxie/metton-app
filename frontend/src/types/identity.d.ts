import { signupSchema } from "@/schemas/identity-schemas";
import * as z from "zod";

export type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;
