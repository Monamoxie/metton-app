"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  Alert,
  AlertTitle,
  Card,
  CircularProgress,
  Stack,
} from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity/identity.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { signupSchema } from "@/schemas/identity";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../magicui/confetti";
import { Dispatch, SetStateAction } from "react";

export type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;

export default function SignUpCard() {
  const t = useTranslations();
  const schema = signupSchema(t);

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isFinished, setIsFinished] = useState(false);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SignupInputs> = async (data) => {
    await processSubmission(
      data,
      setProcessing,
      setResponseErrors,
      setIsFinished
    );
  };

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished && getCompletedContent()}

      {!isFinished && (
        <Card className="identity-form-card">
          <Typography component="h1" variant="h4" className="card-title">
            Create Account
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
                {/* <Link
                component="button"
                // onClick={handleClickOpen}
                variant="body2"
                sx={{ alignSelf: "baseline" }}
              >
                Forgot your password?
              </Link> */}
              </Box>
              <TextField
                {...register("password")}
                error={!!errors.password}
                helperText={(errors.password?.message as string) || ""}
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
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
                autoFocus
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
              {getButtonContent(processing)}
            </Button>
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
  return "Create Account";
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
  data: SignupInputs,
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
      password_conf: data.password_conf,
    }),
  });

  const response = await request.json();
  setProcessing(false);

  !request.ok ? setResponseErrors(response.errors) : setIsFinished(true);
}
// {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
//  <FormControlLabel
//    control={<Checkbox value="remember" color="primary" />}
//    label="Remember me"
//  />;

/* <Link variant="body2" sx={{ alignSelf: "center" }}>
  Have an account? Sign In
</Link>; */
