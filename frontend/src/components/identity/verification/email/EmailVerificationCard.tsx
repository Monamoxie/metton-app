"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import * as AuthService from "@/services/auth-service";
import { Box } from "@mui/material";
import SuccessDisplay from "@/components/SuccessDisplay";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

interface EmailVerificationCardProps {
  token?: string;
}

export default function EmailVerificationCard({
  token,
}: EmailVerificationCardProps) {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token == undefined) return;
        const response = await AuthService.verifyEmailToken(token);

        if (response.code === 200) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setResponseErrors(response.errors);
        }

        setResponseMessage(response.message as string);
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
        <ErrorDisplay errors={responseErrors} message={responseMessage} />
      </Box>
    );
  }

  return (
    <SuccessDisplay
      title={responseMessage}
      ctaMessage="Please Sign in"
      ctaUrl="/identity/signin"
    />
  );
}
