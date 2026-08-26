"use client";

import { Stack } from "@mui/material";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { Suspense, useState } from "react";
import SignUpCompleted from "./SignUpCompleted";
import SignUpForm from "./SignUpForm";

export default function SignUpCard() {
  const [isFinished, setIsFinished] = useState(false);

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished ? (
        <SignUpCompleted />
      ) : (
        <Suspense fallback={null}>
          <SignUpForm setIsFinished={setIsFinished} />
        </Suspense>
      )}
    </Stack>
  );
}
