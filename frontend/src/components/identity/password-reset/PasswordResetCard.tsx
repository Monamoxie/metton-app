"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import { Alert, AlertTitle, Card, Link, Stack } from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useForm, SubmitHandler } from "react-hook-form";
import { passwordResetSchema } from "@/schemas/identity-schemas";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import Confetti from "../../magicui/confetti";
import NextLink from "next/link";
import ButtonContent from "../../ButtonContent";
import { localApiRequest } from "@/utils/utils";
import SuccessDisplay from "../../SuccessDisplay";
import * as AuthService from "@/services/auth-service";
import { CircularProgress, Box, Typography } from "@mui/material";
import PasswordResetCardForm from "./PasswordResetCardForm";

type ResetPasswordInput = z.infer<ReturnType<typeof passwordResetSchema>>;

interface PasswordResetCardProps {
  token?: string;
}

export default function PasswordResetCard({ token }: PasswordResetCardProps) {
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (token == undefined) {
          return setResponseErrors({ name: ["Missing token"] });
        }
        
        const response = await AuthService.verifyPasswordResetToken(token);

        if (response.code === 200) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setProcessing(false);
          setResponseErrors(response.errors);
        }
      } catch (error: any) {
        setProcessing(false);
        setResponseErrors({ error: error.message });
      }
    };

    verifyToken();
  }, [token]);

  if (processing) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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

  return <PasswordResetCardForm token={token} />;
}
