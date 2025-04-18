"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  Alert,
  AlertTitle,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
} from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { forgotPasswordSchema } from "@/schemas/identity-schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../../magicui/confetti";
import { Dispatch, SetStateAction } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

type ForgotPasswordInput = z.infer<ReturnType<typeof forgotPasswordSchema>>;

export default function ForgotPasswordCard() {
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
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema(t)),
  });

  const onSubmit: SubmitHandler<ForgotPasswordInput> = async (data) => {
    await processSubmission(
      data,
      setProcessing,
      setResponseErrors,
      setIsFinished,
      setMessage
    );
  };

  const router = useRouter();

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished && getCompletedContent(message)}

      {!isFinished && (
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={processing}
            >
              {getButtonContent(processing)}
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

function getButtonContent(processing: boolean): JSX.Element | string {
  if (processing) {
    return <CircularProgress size={22} sx={{ color: "#fff" }} />;
  }
  return "Submit Request";
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
  data: ForgotPasswordInput,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  setResponseErrors: Dispatch<SetStateAction<{ [key: string]: string[] }>>,
  setIsFinished: Dispatch<SetStateAction<boolean>>,
  setMessage: Dispatch<SetStateAction<string>>
) {
  setProcessing(true);

  const request = await fetch("/api/identity/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
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
