import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@mui/material";
import ErrorDisplay from "./ErrorDisplay";
import { useState } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SuccessDisplay from "@/components/SuccessDisplay";
import * as AuthService from "@/services/auth-service";

interface EmailVerificationReminder {
  email: string;
}
export default function EmailVerificationReminder(
  props: EmailVerificationReminder
) {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});

  const handleResend = async () => {
    try {
      setProcessing(true);
      const response = await AuthService.resendEmailVerificationNotification(
        props.email
      );

      if (response.code === 200) {
        setIsEmailSent(true);
      } else {
        setResponseErrors(response.errors);
      }
    } catch (error: any) {
      setResponseErrors({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  if (isEmailSent) {
    return (
      <SuccessDisplay
        title="Verification Email Sent"
        message="A verification email has been sent to your email address. Please check your inbox."
      />
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      {responseErrors && <ErrorDisplay errors={responseErrors} />}
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ErrorOutlineIcon color="warning" fontSize="large" />
          <Box>
            <Typography variant="h6" component="h6" sx={{ fontWeight: "bold" }}>
              Your email address is not verified!
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Please verify your email address to access all features.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleResend}
              disabled={processing}
            >
              {processing ? "Sending..." : "Resend Verification Email"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
