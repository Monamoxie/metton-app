"use client";

import { Card, CardActionArea, CardContent, Chip, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { TeamSummary } from "@/types/workspace";

interface TeamSummaryGridProps {
  teams: TeamSummary[];
  onTeamClick: (team: TeamSummary) => void;
}

export default function TeamSummaryGrid({ teams, onTeamClick }: TeamSummaryGridProps) {
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
            <CardActionArea onClick={() => onTeamClick(team)} sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {team.name}
                  </Typography>
                  {team.is_default && (
                    <Chip label="default" size="small" color="info" variant="outlined" />
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
