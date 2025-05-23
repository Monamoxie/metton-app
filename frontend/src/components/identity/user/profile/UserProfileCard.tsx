"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Card } from "@mui/material";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useTranslations } from "next-intl";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { useTheme } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import * as UserService from "@/services/user-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import UserProfileForm from "./UserProfileForm";
import { UserProfile } from "@/types/identity";
import EmailVerificationReminder from "@/components/EmailVerificationReminder";

export default function ProfileCard() {
  const t = useTranslations();
  const theme = useTheme();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [fetchingData, setFetchingData] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

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

      <Box>
        <UserProfileForm user={user} setUser={setUser} />
      </Box>
    </Stack>
  );
}
