"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import GroupIcon from "@mui/icons-material/Group";
import { Team } from "@/types/workspace";

interface TeamsGridProps {
  teams: Team[];
  onTeamClick: (team: Team) => void;
}

export default function TeamsGrid({ teams, onTeamClick }: TeamsGridProps) {
  return (
    <Grid container spacing={2}>
      {teams.map((team) => (
        <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              transition: "border-color 0.2s",
              "&:hover": { borderColor: "primary.main" },
            }}
          >
            <CardActionArea
              onClick={() => onTeamClick(team)}
              sx={{ height: "100%", p: 0 }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {team.name}
                  </Typography>
                  {team.isDefault && (
                    <Chip label="default" size="small" color="info" variant="outlined" />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {team.description}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <GroupIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
