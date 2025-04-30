"use client";

import { SetStateProp } from "@/types/core";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Card, CircularProgress, Link } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm, SubmitHandler } from "react-hook-form";
import { forgotPasswordSchema } from "@/schemas/identity-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import NextLink from "next/link";
import useRecaptcha from "@/hooks/use-recaptcha";
import * as AuthService from "@/services/auth-service";
import { ForgotPasswordInputs } from "@/types/identity";

interface ForgotPasswordFormProps {
  setIsFinished: SetStateProp<boolean>;
}

export default function ForgotPasswordForm({
  setIsFinished,
}: ForgotPasswordFormProps) {
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
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema(t)),
  });

  const onSubmit: SubmitHandler<ForgotPasswordInputs> = async (data) => {
    try {
      setProcessing(true);

      const recaptchaToken = await handleRecaptcha();
      if (recaptchaToken) {
        data.recaptcha = recaptchaToken;
      }

      const response = await AuthService.requestPasswordReset(data);
      if (response.code === 200) {
        return setIsFinished(true);
      }
    } catch (error: any) {
      setResponseErrors({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="identity-form-card">
      <Typography component="h4" variant="h4" className="card-title">
        Password Reset Request
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
          {processing ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : (
            "Submit Request"
          )}
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
  );
}
