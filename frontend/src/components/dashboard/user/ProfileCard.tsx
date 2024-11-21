"use client";

import React from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useTheme } from "@mui/material";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { UserProfile } from "@/types/identity";

export default function ProfileCard(user: UserProfile) {
  const theme = useTheme();
  return (
    <Box sx={PROFILE_CARD_CSS(theme)}>
      {/* Header Section */}
      <Box className="pf-header">
        <Box
          component="img"
          src="/path-to-logo.png"
          className="pf-header-img"
        />
        <Box>
          <Box className="pf-name">
            <Typography variant="h6">{user.name}</Typography>
            <VerifiedIcon className="pf-verified-icon" />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            untitledui.com/sisyphus
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Company profile
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Update your company photo and details here.
        </Typography>

        {/* Public Profile */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Public profile
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            This will be displayed on your profile.
          </Typography>
          <TextField
            fullWidth
            value="Sisyphus Ventures"
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.paper",
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Company Logo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Company logo
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Update your company logo and then choose where you want it to
            display.
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              component="img"
              src="/path-to-logo.png"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "#d6ff99",
              }}
            />
            <Box
              sx={{
                flex: 1,
                p: 3,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 1,
                textAlign: "center",
                bgcolor: "background.paper",
              }}
            >
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

        {/* Branding */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Branding
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Add your logo to reports and emails.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography variant="body2">Reports</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Include my logo in summary reports.
                </Typography>
              </Box>
              <input type="checkbox" checked />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderRadius: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box>
                <Typography variant="body2">Emails</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Include my logo in customer emails.
                </Typography>
              </Box>
              <input type="checkbox" checked />
            </Box>
          </Box>
        </Box>

        {/* Social Profiles */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Social profiles
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="twitter.com/"
              value="sisyphusvc"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderRadius: 1,
                },
              }}
            />
            <TextField
              fullWidth
              placeholder="linkedin.com/"
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
