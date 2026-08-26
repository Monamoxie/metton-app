"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { authStore } from "@/stores/auth-store";
import { InvitationPeek } from "@/types/workspace";
import * as InvitationService from "@/services/invitation-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

type ViewState =
  | "loading"
  | "not_found"
  | "expired"
  | "signed_out"
  | "email_mismatch"
  | "accepting"
  | "error";

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [state, setState] = useState<ViewState>("loading");
  const [invitation, setInvitation] = useState<InvitationPeek | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const peekResponse = await InvitationService.peekInvitation(token);

      if (peekResponse.code === 404) {
        setState("not_found");
        return;
      }
      if (peekResponse.code !== 200) {
        setState("expired");
        return;
      }

      const invite = peekResponse.data.invitation as InvitationPeek;
      setInvitation(invite);

      const { token: authToken, user } = authStore.getState();
      if (!authToken || !user) {
        setState("signed_out");
        return;
      }

      if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
        setState("email_mismatch");
        return;
      }

      setState("accepting");
      const acceptResponse = await InvitationService.acceptInvitation(token);
      if (acceptResponse.code !== 200) {
        setErrorMessage(acceptResponse.message || "Unable to accept this invitation.");
        setState("error");
        return;
      }

      router.push(`/workspace/${acceptResponse.data.workspace.slug}`);
    };

    run();
  }, [token, router]);

  if (state === "loading" || state === "accepting") {
    return <CircularProgressBox />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        px: 3,
      }}
    >
      <Stack spacing={2} sx={{ maxWidth: 420, textAlign: "center" }}>
        {state === "not_found" && (
          <>
            <Typography variant="h5">Invitation not found</Typography>
            <Typography color="text.secondary">
              This invite link is invalid. Ask whoever invited you to send a new one.
            </Typography>
          </>
        )}

        {state === "expired" && (
          <>
            <Typography variant="h5">Invitation expired</Typography>
            <Typography color="text.secondary">
              This invite link has expired. Ask whoever invited you to send a new one.
            </Typography>
          </>
        )}

        {state === "error" && (
          <>
            <Typography variant="h5">Something went wrong</Typography>
            <Alert severity="error">{errorMessage}</Alert>
          </>
        )}

        {state === "email_mismatch" && invitation && (
          <>
            <Typography variant="h5">Wrong account</Typography>
            <Typography color="text.secondary">
              This invitation was sent to <strong>{invitation.email}</strong>, but
              you&apos;re signed in with a different account. Sign out and try again.
            </Typography>
          </>
        )}

        {state === "signed_out" && invitation && (
          <>
            <Typography variant="h5">
              Join {invitation.workspace_name} on Metton
            </Typography>
            <Typography color="text.secondary">
              You&apos;ve been invited as {invitation.role.toLowerCase() === "admin" ? "an" : "a"}{" "}
              {invitation.role}. Sign in or create an account with{" "}
              <strong>{invitation.email}</strong> to accept.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                component={NextLink}
                href={`/identity/signin?invite_token=${token}&email=${encodeURIComponent(invitation.email)}`}
                variant="outlined"
              >
                Sign in
              </Button>
              <Button
                component={NextLink}
                href={`/identity/signup?invite_token=${token}&email=${encodeURIComponent(invitation.email)}`}
                variant="contained"
              >
                Create account
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  );
}
