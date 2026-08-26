"use client";

import * as React from "react";
import { Alert, Stack } from "@mui/material";
import { IDENTITY_FORM_CARD_CSS } from "@/styles/modules/identity.css";
import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import SignInForm from "./SignInForm";
import * as InvitationService from "@/services/invitation-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

export default function SignInCard() {
  const [isFinished, setIsFinished] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite_token");

  useEffect(() => {
    if (!isFinished || !inviteToken) return;

    const acceptInvite = async () => {
      const response = await InvitationService.acceptInvitation(inviteToken);
      if (response.code !== 200) {
        setInviteError(response.message || "Unable to accept this invitation.");
        return;
      }
      router.push(`/workspace/${response.data.workspace.slug}`);
    };

    acceptInvite();
  }, [isFinished, inviteToken, router]);

  if (isFinished && inviteToken) {
    if (inviteError) {
      return (
        <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
          <Alert severity="error">{inviteError}</Alert>
        </Stack>
      );
    }
    return <CircularProgressBox />;
  }

  return (
    <Stack direction="column" sx={IDENTITY_FORM_CARD_CSS}>
      {isFinished ? (
        redirect("/workspace")
      ) : (
        <SignInForm setIsFinished={setIsFinished} />
      )}
    </Stack>
  );
}
