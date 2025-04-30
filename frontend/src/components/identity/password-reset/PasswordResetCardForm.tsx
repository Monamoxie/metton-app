"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Alert, AlertTitle, Card, Link, Stack } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { passwordResetSchema } from "@/schemas/identity-schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../../magicui/confetti";
import NextLink from "next/link";
import ButtonContent from "../../ButtonContent";
import { localApiRequest } from "@/utils/utils";
import SuccessDisplay from "../../SuccessDisplay";
import { SetStateProp } from "@/types/core";
import useRecaptcha from "@/hooks/use-recaptcha";
import * as AuthService from "@/services/auth-service";
import { PasswordResetInput } from "@/types/identity";

interface FormProps {
  token: string;
  setIsResetComplete: SetStateProp<boolean>;
}

export default function PasswordResetCardForm({
  token,
  setIsResetComplete,
}: FormProps) {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);

  const t = useTranslations();
  const { handleRecaptcha } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema(t)),
  });

  const onSubmit: SubmitHandler<PasswordResetInput> = async (data) => {
    try {
      setProcessing(true);

      const recaptchaToken = await handleRecaptcha();
      if (recaptchaToken) {
        data.recaptcha = recaptchaToken;
      }

      const response = await AuthService.passwordReset(token, data);
      if (response.code === 200) {
        return setIsResetComplete(true);
      }

      return setResponseErrors(response.errors);
    } catch (error: any) {
      setResponseErrors({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      <Card className="identity-form-card">
        <Typography component="h4" variant="h4" className="card-title">
          Password Reset
        </Typography>
        {responseErrors && <ErrorDisplay errors={responseErrors} />}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="card-content"
        >
          <FormControl>
            <Box className="password-label-wrap">
              <FormLabel htmlFor="password">Password</FormLabel>
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
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password-conf">Re-enter Password</FormLabel>
            <TextField
              {...register("password_confirmation")}
              error={!!errors.password_confirmation}
              helperText={
                (errors.password_confirmation?.message as string) || ""
              }
              name="password_confirmation"
              placeholder="••••••"
              type="password"
              id="password-confirmation"
              autoComplete="confirm-password"
              required
              sx={{ ariaLabel: "password-confirmation" }}
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
            {
              <ButtonContent
                processing={processing}
                defaultText={"Reset Password"}
              />
            }
          </Button>

          <Link
            href="/identity/signin"
            component={NextLink}
            variant="body1"
            sx={{ mt: 2 }}
          >
            Remember password? Sign In.
          </Link>
        </Box>
      </Card>
    </Stack>
  );
}
