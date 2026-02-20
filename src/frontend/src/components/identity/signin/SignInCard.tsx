"use client";

import * as React from "react";
import { Stack } from "@mui/material";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useState } from "react";
import { redirect } from "next/navigation";
import SignInForm from "./SignInForm";

export default function SignInCard() {
  const [isFinished, setIsFinished] = useState(false);

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished ? (
        redirect("/dashboard")
      ) : (
        <SignInForm setIsFinished={setIsFinished} />
      )}
    </Stack>
  );
}
