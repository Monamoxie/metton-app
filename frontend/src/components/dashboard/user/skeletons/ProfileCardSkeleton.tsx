"use client";

import React from "react";
import { Box, Skeleton } from "@mui/material";
import { useTheme } from "@mui/material";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";

export default function ProfileCardSkeleton() {
  const theme = useTheme();

  return (
    <Box sx={PROFILE_CARD_CSS(theme)}>
      {/* Header Section */}
      <Box className="pf-header">
        <Skeleton variant="circular" width={48} height={48} />
        <Box>
          <Box className="pf-name">
            <Skeleton variant="text" width="70%" height={20} />
          </Box>
          <Skeleton variant="text" width="50%" height={16} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="80%" height={16} sx={{ mb: 4 }} />

        {/* Public Profile */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Box>

        {/* Company Logo */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Skeleton variant="circular" width={48} height={48} />
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
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={16} />
              <Skeleton variant="text" width="50%" height={14} />
            </Box>
          </Box>
        </Box>

        {/* Branding */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
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
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" width={20} height={20} />
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
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" width={20} height={20} />
            </Box>
          </Box>
        </Box>

        {/* Social Profiles */}
        <Box>
          <Skeleton variant="text" width="40%" height={20} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Skeleton variant="text" width="100%" height={40} />
            <Skeleton variant="text" width="100%" height={40} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
