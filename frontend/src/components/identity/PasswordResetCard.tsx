"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  Alert,
  AlertTitle,
  Card,
  CircularProgress,
  Link,
  Stack,
} from "@mui/material";
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
import { Dispatch, SetStateAction } from "react";
import NextLink from "next/link";
import ButtonContent from "../ButtonContent";

type ResetPasswordInput = z.infer<ReturnType<typeof passwordResetSchema>>;

export default function PasswordResetCard() {
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
    await processSubmission(
      data,
      setProcessing,
      setResponseErrors,
      setIsFinished,
      setMessage
    );
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
                {...register("password_conf")}
                error={!!errors.password_conf}
                helperText={(errors.password_conf?.message as string) || ""}
                name="password_conf"
                placeholder="••••••"
                type="password"
                id="password-conf"
                autoComplete="confirm-password"
                required
                sx={{ ariaLabel: "password-conf" }}
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
      <Alert sx={{ p: 5 }} severity="success">
        <AlertTitle>
          <h1>Password Reset Request</h1>
        </AlertTitle>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          {message}
        </Typography>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          You should receive a reset link shortly. Click on the link to get
          started.
        </Typography>
      </Alert>
    </>
  );
}

async function processSubmission(
  data: ResetPasswordInput,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  setResponseErrors: Dispatch<SetStateAction<{ [key: string]: string[] }>>,
  setIsFinished: Dispatch<SetStateAction<boolean>>,
  setMessage: Dispatch<SetStateAction<string>>
) {
  setProcessing(true);

  const request = await fetch("/api/identity/password-reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: data.password,
      password_conf: data.password_conf,
    }),
  });

  const response = await request.json();
  setProcessing(false);

  if (response.code !== 200) {
    return setResponseErrors(response.errors);
  }

  setIsFinished(true);
  setMessage(response.message);
}
