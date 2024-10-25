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
import { signupSchema } from "@/schemas/identity-schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../magicui/confetti";
import { Dispatch, SetStateAction } from "react";
import NextLink from "next/link";
import { SignupInputs } from "@/types/identity";
import { localApiRequest } from "@/utils/utils";
import ButtonContent from "../ButtonContent";
import SuccessDisplay from "../SuccessDisplay";

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
    await localApiRequest({
      url: "/api/identity/signup",
      method: "POST",
      body: data,
      setProcessing,
      setResponseErrors,
      setIsFinished,
    });
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
              </Box>
              <TextField
                {...register("password1")}
                error={!!errors.password1}
                helperText={(errors.password1?.message as string) || ""}
                placeholder="*******"
                type="password"
                id="password1"
                required
                sx={{ ariaLabel: "password1" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password2">Re-enter Password</FormLabel>
              <TextField
                {...register("password2")}
                error={!!errors.password2}
                helperText={(errors.password2?.message as string) || ""}
                name="password2"
                placeholder="*******"
                type="password"
                id="password2"
                required
                sx={{ ariaLabel: "password2" }}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={processing}
            >
              <ButtonContent
                processing={processing}
                defaultText={"Create Account"}
              />
            </Button>
          </Box>
          <Link href="/identity/signin" component={NextLink}>
            Have an account? Sign In
          </Link>
        </Card>
      )}
    </Stack>
  );
}

function getCompletedContent(): JSX.Element {
  return (
    <>
      <Confetti />
      <SuccessDisplay
        title={"Welcome to Metton!"}
        message={"Your account has been successfully created!"}
      >
        A confirmation link has just been sent to your email address. Click on
        the confirmation link to get started.
      </SuccessDisplay>
    </>
  );
}
