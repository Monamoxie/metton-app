"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Link from "next/link";
import { Team } from "@/types/workspace";
import { mockMembers, mockTeams } from "@/data/mock/workspace";
import TeamsGrid from "@/components/workspace/TeamsGrid";
import CreateTeamDialog from "@/components/workspace/CreateTeamDialog";

export default function WorkspaceTeamsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const router = useRouter();

  const handleTeamClick = (team: Team) => {
    router.push(`/workspace/${slug}/teams/${team.id}`);
  };

  return (
    <Box>
      {/* Back link */}
      <Button
        component={Link}
        href={`/workspace/${slug}`}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to workspace
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Teams ({mockTeams.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<GroupAddOutlinedIcon />}
          onClick={() => setCreateTeamOpen(true)}
        >
          Create team
        </Button>
      </Box>

      {/* Teams grid */}
      <TeamsGrid teams={mockTeams} onTeamClick={handleTeamClick} />

      {/* Create team dialog */}
      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        existingMembers={mockMembers}
      />
    </Box>
  );
}
