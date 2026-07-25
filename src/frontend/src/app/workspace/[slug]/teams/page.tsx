"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Link from "next/link";
import { TeamSummary } from "@/types/workspace";
import { mockMembers } from "@/data/mock/workspace";
import TeamSummaryGrid from "@/components/workspace/TeamSummaryGrid";
import CreateTeamDialog from "@/components/workspace/CreateTeamDialog";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import * as TeamService from "@/services/team-service";

export default function WorkspaceTeamsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      setFetchingData(true);
      const response = await TeamService.listTeams(slug);
      setTeams(response.code === 200 ? response.data.teams : []);
      setFetchingData(false);
    };

    fetchTeams();
  }, [slug]);

  const handleTeamClick = (team: TeamSummary) => {
    router.push(`/workspace/${slug}/teams/${team.slug}`);
  };

  if (fetchingData) {
    return <CircularProgressBox />;
  }

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
          Teams ({teams.length})
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
      <TeamSummaryGrid teams={teams} onTeamClick={handleTeamClick} />

      {/* Create team dialog */}
      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        existingMembers={mockMembers}
      />
    </Box>
  );
}
