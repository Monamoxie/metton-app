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
import { signInSchema } from "@/schemas/identity";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../magicui/confetti";
import { Dispatch, SetStateAction } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

type SignInInputs = z.infer<ReturnType<typeof signInSchema>>;

export default function SignInCard() {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [processing, setProcessing] = useState(false);

  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInputs>({
    resolver: zodResolver(signInSchema(t)),
  });

  const onSubmit: SubmitHandler<SignInInputs> = async (data) => {
    await processSubmission(
      data,
      setProcessing,
      setResponseErrors,
      setIsFinished
    );
  };

  const router = useRouter();

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished && getCompletedContent()}

      {!isFinished && (
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
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
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
              href="/identity/signup"
              component={NextLink}
              variant="body1"
              sx={{ mt: 2 }}
            >
              No account? Create One. It&apos;s Free
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
  return "Sign In";
}

function getCompletedContent(): JSX.Element {
  return (
    <>
      <Confetti />
      <Alert sx={{ p: 5 }} severity="success">
        <AlertTitle>
          <h1>Welcome to Metton!</h1>
        </AlertTitle>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          Your account has been successfully created.
        </Typography>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          A confirmation link has just been sent to your email address. <br />
          Click on the confirmation link to get started.
        </Typography>
      </Alert>
    </>
  );
}

async function processSubmission(
  data: SignInInputs,
  setProcessing: Dispatch<SetStateAction<boolean>>,
  setResponseErrors: Dispatch<SetStateAction<{ [key: string]: string[] }>>,
  setIsFinished: Dispatch<SetStateAction<boolean>>
) {
  setProcessing(true);

  const request = await fetch("/api/identity/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  });

  const response = await request.json();
  setProcessing(false);

  !request.ok ? setResponseErrors(response.errors) : setIsFinished(true);
}
