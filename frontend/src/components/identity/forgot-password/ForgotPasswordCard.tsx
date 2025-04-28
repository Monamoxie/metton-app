"use client";

import { Stack } from "@mui/material";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useState } from "react";
import ForgotPasswordCardCompleted from "./ForgotPasswordCardCompleted";
import ForgotPasswordCardForm from "./ForgotPasswordCardForm";

export default function ForgotPasswordCard() {
  const [isFinished, setIsFinished] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished ? (
        <ForgotPasswordCardCompleted message={message} />
      ) : (
        <ForgotPasswordCardForm
          setIsFinished={setIsFinished}
        />
      )}
    </Stack>
  );
}
