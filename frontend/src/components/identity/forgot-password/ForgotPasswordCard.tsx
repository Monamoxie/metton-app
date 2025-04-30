"use client";

import { Stack } from "@mui/material";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useState } from "react";
import ForgotPasswordCompleted from "./ForgotPasswordCompleted";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordCard() {
  const [isFinished, setIsFinished] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished ? (
        <ForgotPasswordCompleted message={message} />
      ) : (
        <ForgotPasswordForm
          setIsFinished={setIsFinished}
        />
      )}
    </Stack>
  );
}
