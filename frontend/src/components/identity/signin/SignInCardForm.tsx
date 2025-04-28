"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Card, Checkbox, FormControlLabel, Link, Stack } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { signInSchema } from "@/schemas/identity-schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";

import NextLink from "next/link";
import { redirect, useRouter } from "next/navigation";
import { localApiRequest } from "@/utils/utils";
import ButtonContent from "../../ButtonContent";
import { SigninInputs } from "@/types/identity";
import { SetIsFinishedProps } from "@/types/core";
import useRecaptcha from "@/hooks/use-recaptcha";
import * as AuthService from "@/services/auth-service";

// --- Form ---
const SignInFormCard: React.FC<SetIsFinishedProps> = ({ setIsFinished }) => {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});

  const t = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInputs>({
    resolver: zodResolver(signInSchema(t)),
  });
  const [processing, setProcessing] = useState(false);

  const { handleRecaptcha } = useRecaptcha();

  const onSubmit: SubmitHandler<SigninInputs> = async (data) => {
    try {
      setProcessing(true);

      const recaptchaToken = await handleRecaptcha();
      if (recaptchaToken) {
        data.recaptcha = recaptchaToken;
      }

      const response = await AuthService.signIn(data);
      if (response.code === 200) {
        AuthService.persistUserSession(
          response.data.token,
          response.data.user,
          data.remember_me
        );
        return setIsFinished(true);
      }

      return setResponseErrors(response.errors);
    } catch (error: any) {
      setResponseErrors({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="identity-form-card">
      <Typography component="h4" variant="h4" className="card-title">
        Sign In
      </Typography>
      {responseErrors && <ErrorDisplay errors={responseErrors} />}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="card-content"
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            {...register("email")}
            error={!!errors.email}
            helperText={(errors.email?.message as string) || ""}
            id="email"
            type="email"
            placeholder={t("prompts.ENTER_YOUR_DATA", {
              data: "email address",
            })}
            autoComplete="true"
            autoFocus
            required
            sx={{ ariaLabel: "email" }}
          />
        </FormControl>
        <FormControl>
          <Box className="password-label-wrap">
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="span"
              onClick={() => router.push("/identity/forgot-password")}
              variant="body2"
              sx={{ alignSelf: "baseline", cursor: "pointer" }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            {...register("password")}
            error={!!errors.password}
            helperText={(errors.password?.message as string) || ""}
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            sx={{ ariaLabel: "password" }}
          />
          <FormControlLabel
            control={<Checkbox {...register("remember_me")} color="primary" />}
            label="Remember me"
          />
        </FormControl>
        <FormControl sx={{ display: "none" }}>
          <FormLabel htmlFor="source">Source</FormLabel>
          <TextField
            {...register("source")}
            name="source"
            type="hidden"
            id="source"
            required
            sx={{ ariaLabel: "source" }}
          />
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={processing}
        >
          <ButtonContent processing={processing} defaultText="Sign In" />
        </Button>

        <Link
          href="/identity/signup"
          component={NextLink}
          variant="body1"
          sx={{ mt: 2 }}
        >
          No account? Create One. It&apos;s Free
        </Link>
      </Box>
    </Card>
  );
};

export default SignInFormCard;
