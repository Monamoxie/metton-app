"use client";

import { Avatar, Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import NotesIcon from "@mui/icons-material/Notes";
import { PublicHostProfile } from "@/types/booking";

interface HostPanelProps {
  profile: PublicHostProfile | null;
  duration: number;
  onDurationChange: (duration: number) => void;
}

const DURATIONS = [15, 30, 60];

const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const HostPanel: React.FC<HostPanelProps> = ({ profile, duration, onDurationChange }) => {
  return (
    <Box
      sx={{
        p: { xs: 3, md: 4.5 },
        borderRight: { md: "1px solid" },
        borderBottom: { xs: "1px solid", md: "none" },
        borderColor: "divider",
      }}
    >
      <Avatar
        src={profile?.profile_photo || undefined}
        sx={{
          width: 72,
          height: 72,
          mb: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontFamily: "var(--font-display)",
          fontSize: 26,
          border: "2px solid",
          borderColor: "primary.light",
        }}
      >
        {profile ? initials(profile.name) : ""}
      </Avatar>

      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 22, mb: 0.5 }}>
        {profile?.name || " "}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        {[profile?.position, profile?.company].filter(Boolean).join(" at ")}
      </Typography>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
          Meeting length
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={duration}
          onChange={(_e, value) => value && onDurationChange(value)}
        >
          {DURATIONS.map((value) => (
            <ToggleButton key={value} value={value}>
              {value}m
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {profile?.profile_summary && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 3, lineHeight: 1.6 }}>
          {profile.profile_summary}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.75 }}>
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
          <PublicIcon fontSize="small" sx={{ color: "text.secondary", mt: 0.25 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Times shown in your local timezone
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
          <EventAvailableIcon fontSize="small" sx={{ color: "text.secondary", mt: 0.25 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            You&apos;ll get a confirmation once your booking is made
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
          <NotesIcon fontSize="small" sx={{ color: "text.secondary", mt: 0.25 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Please be ready 2-3 min before
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HostPanel;
