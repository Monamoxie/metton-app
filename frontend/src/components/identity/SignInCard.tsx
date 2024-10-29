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
import ButtonContent from "../ButtonContent";
import { SigninInputs } from "@/types/identity";

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
  } = useForm<SigninInputs>({
    resolver: zodResolver(signInSchema(t)),
  });

  const onSubmit: SubmitHandler<SigninInputs> = async (data) => {
    await localApiRequest({
      url: "/api/identity/signin",
      method: "POST",
      body: data,
      setProcessing,
      setResponseErrors,
      setIsFinished,
    });
  };

  const router = useRouter();

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished && redirect("/dashboard ")}

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
                control={
                  <Checkbox {...register("remember_me")} color="primary" />
                }
                label="Remember me"
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
      )}
    </Stack>
  );
}
