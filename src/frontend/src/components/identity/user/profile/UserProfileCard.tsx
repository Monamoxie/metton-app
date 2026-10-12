"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Card, TextField, IconButton, Tooltip } from "@mui/material";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useTranslations } from "next-intl";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { useTheme } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/Check";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import * as UserService from "@/services/user-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import UserProfileForm from "./UserProfileForm";
import { UserProfile } from "@/types/identity";
import EmailVerificationReminder from "@/components/EmailVerificationReminder";
import { getUserPublicProfileUrl } from "@/utils/utils";

export default function ProfileCard() {
  const t = useTranslations();
  const theme = useTheme();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [fetchingData, setFetchingData] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await UserService.getProfile();

        if (response.code === 200) {
          setUser(response.data);
        } else {
          setUser(null);
          setResponseErrors(response.errors);
        }
      } catch (error: any) {
        setResponseErrors({ error: error.message });
      } finally {
        setFetchingData(false);
      }
    };

    getProfile();
  }, []);

  if (fetchingData) {
    return <CircularProgressBox />;
  } else if (!user) {
    return <ErrorDisplay errors={responseErrors} />;
  }

  const bookingBaseUrl = process.env.NEXT_PUBLIC_TEMP_APP_URL || "";
  const bookingUrl = bookingBaseUrl
    ? getUserPublicProfileUrl(user.public_id, bookingBaseUrl)
    : null;

  const copyBookingLink = async () => {
    if (!bookingUrl) return;
    await navigator.clipboard.writeText(bookingUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Stack sx={PROFILE_CARD_CSS(theme)}>
      <Box className="pf-header">
        <Box
          component="img"
          src={user.profile_photo || "https://place-hold.it/300x500"}
          className="pf-header-img"
        />

        <Box>
          <Box className="pf-name">
            <Typography variant="h6">{user.name}</Typography>
            {user.email_verified && (
              <VerifiedIcon className="pf-verified-icon" />
            )}
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user.position}
          </Typography>
        </Box>
      </Box>

      {!user.email_verified && <EmailVerificationReminder email={user.email} />}

      {bookingUrl && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Your booking link
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            Share this with anyone who wants to book time with you.
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              value={bookingUrl}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { readOnly: true } }}
            />
            <Tooltip title={linkCopied ? "Copied!" : "Copy link"}>
              <IconButton onClick={copyBookingLink} aria-label="copy booking link">
                {linkCopied ? <CheckIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Open booking page">
              <IconButton
                component="a"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="open booking link"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      <Box>
        <UserProfileForm user={user} setUser={setUser} />
      </Box>
    </Stack>
  );
}
