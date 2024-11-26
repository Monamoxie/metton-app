"use client";

import React from "react";
import { Box, Typography, TextField, IconButton, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useTheme } from "@mui/material";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { UserProfileCardProps } from "@/types/identity";
import { getUserPublicProfileUrl } from "@/utils/utils";
import ButtonContent from "@/components/ButtonContent";

export default function ProfileCard({ user, base_url }: UserProfileCardProps) {
  const theme = useTheme();
  return (
    <Box sx={PROFILE_CARD_CSS(theme)}>
      {/* Header Section */}
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

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Public Profile */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Profile Link
          </Typography>
          <TextField
            fullWidth
            value={getUserPublicProfileUrl(user.public_id, base_url)}
            variant="outlined"
            size="small"
            disabled={true}
          />
        </Box>

        {/* Profile Photo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Update Profile Photo
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2 }}
          ></Typography>

          <Box className="pf-upload-profile-photo-wrapper">
            <Box
              component="img"
              src={user.profile_photo as string}
              className="pf-upload-profile-photo-preview"
            />
            <Box className="pf-upload-profile-photo-dropper">
              <IconButton>
                <CloudUploadIcon />
              </IconButton>
              <Typography variant="body2">
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                SVG, PNG, JPG or GIF (max. 800x400px)
              </Typography>
            </Box>
          </Box>
        </Box>

        {/*  */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Company
          </Typography>
          <TextField
            fullWidth
            value={user.company}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Position
          </Typography>
          <TextField
            fullWidth
            value={user.position}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            About
          </Typography>
          <TextField
            fullWidth
            value={user.profile_summary}
            variant="outlined"
          />
        </Box>
      </Box>

      <Button type="submit" variant="contained" disabled={false}>
        <ButtonContent processing={false} defaultText="Update Profile" />
      </Button>
    </Box>
  );
}
