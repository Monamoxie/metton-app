"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import * as AuthService from "@/services/auth-service";
import { Box } from "@mui/material";
import PasswordResetForm from "./PasswordResetForm";
import PasswordResetCompleted from "./PasswordResetCompleted";
import * as CoreUtil from "@/utils/core-util";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

interface PasswordResetCardProps {
  token?: string;
}

export default function PasswordResetCard({ token }: PasswordResetCardProps) {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token == undefined) return;
        const response = await AuthService.verifyPasswordResetToken(token);

        if (response.code === 200) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setResponseErrors(response.errors);
        }
      } catch (error: any) {
        setIsValidToken(false);
        setResponseErrors({ error: error.message });
      } finally {
        setIsValidatingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  // validating
  if (isValidatingToken) return <CircularProgressBox />;

  if (!isValidToken) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <ErrorDisplay
          errors={responseErrors}
          message={"Token Verification Failed"}
        />
      </Box>
    );
  }

  if (isResetComplete) return <PasswordResetCompleted />;

  return CoreUtil.hasRecaptcha() ? (
    <GoogleReCaptchaProvider reCaptchaKey={CoreUtil.getRecaptchaKey()}>
      <PasswordResetForm
        token={token as string}
        setIsResetComplete={setIsResetComplete}
      />
    </GoogleReCaptchaProvider>
  ) : (
    <PasswordResetForm
      token={token as string}
      setIsResetComplete={setIsResetComplete}
    />
  );
}
