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

export default function ProfileCard() {
  const t = useTranslations();
  const theme = useTheme();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await UserService.getUserProfile();

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

    getUserProfile();
  }, []);

  if (fetchingData) {
    return <CircularProgressBox />;
  } else if (!user) {
    return <ErrorDisplay errors={responseErrors} />;
  }

  return (
    <Stack sx={PROFILE_CARD_CSS(theme)}>
      {isFinished && (
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          Profile updated successfully!
        </Typography>
      )}

      <Box className="pf-header">
        <Box
          component="img"
          src={user.profile_photo as string}
          className="pf-header-img"
        />
        <Box>
          <Box className="pf-name">
            <Typography variant="h6">{user.name}</Typography>
            <VerifiedIcon className="pf-verified-icon" />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user.position}
          </Typography>
        </Box>
      </Box>

      <Card className="pf-header">
        <UserProfileForm user={user} />
      </Card>
    </Stack>
  );
}
