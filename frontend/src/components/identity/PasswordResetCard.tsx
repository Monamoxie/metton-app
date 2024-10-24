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
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../magicui/confetti";
import NextLink from "next/link";
import ButtonContent from "../ButtonContent";
import { localApiRequest } from "@/utils/utils";
import SuccessDisplay from "../SuccessDisplay";

type ResetPasswordInput = z.infer<ReturnType<typeof passwordResetSchema>>;

interface PasswordResetCardProps {
  token?: string;
}

export default function PasswordResetCard({ token }: PasswordResetCardProps) {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(passwordResetSchema(t)),
  });

  const onSubmit: SubmitHandler<ResetPasswordInput> = async (data) => {
    const body = {
      ...data,
      token,
    };

    await localApiRequest({
      url: "/api/identity/password-reset",
      method: "POST",
      body,
      setProcessing,
      setResponseErrors,
      setIsFinished,
      setMessage,
    });
  };

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished && getCompletedContent(message)}

      {!isFinished && (
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
      )}
    </Stack>
  );
}

function getCompletedContent(message: string): JSX.Element {
  return (
    <>
      <Confetti />
      <SuccessDisplay
        title={"Password Reset"}
        message={
          "You have a new password. Sign In and continue from where you left off"
        }
        ctaMessage="Sign In"
        ctaUrl="/signin"
      />
    </>
  );
}
