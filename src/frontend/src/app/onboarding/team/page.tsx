"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";
import ButtonContent from "@/components/ButtonContent";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

export default function OnboardingTeamPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingState = async () => {
      const workspacesResponse = await WorkspaceService.listWorkspaces();
      const workspace = workspacesResponse.data?.workspaces?.[0];
      if (!workspace) {
        router.replace("/workspace");
        return;
      }

      const teamsResponse = await TeamService.listTeams(workspace.slug);
      const teams = teamsResponse.data?.teams ?? [];
      const hasManuallyCreatedTeam = teams.some((team: any) => !team.is_default);
      if (hasManuallyCreatedTeam) {
        router.replace("/dashboard");
        return;
      }

      setWorkspaceSlug(workspace.slug);
      setChecking(false);
    };

    checkOnboardingState();
  }, [router]);

  const handleCreate = async () => {
    if (teamName.trim().length < 2 || !workspaceSlug) return;

    setProcessing(true);
    setErrorMessage(null);
    try {
      const response = await TeamService.createTeam(
        workspaceSlug,
        teamName.trim()
      );

      if (response.code !== 201) {
        setErrorMessage(response.message || "Unable to create team.");
        return;
      }

      router.replace("/dashboard");
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = () => {
    router.replace("/dashboard");
  };

  if (checking) {
    return <CircularProgressBox />;
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", py: 6 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Create your first team
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="Team name"
          placeholder="My Team"
          fullWidth
          size="small"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          error={teamName.length > 0 && teamName.trim().length < 2}
          helperText={
            teamName.length > 0 && teamName.trim().length < 2
              ? "Team name must be at least 2 characters."
              : "You can create more teams and add members from your dashboard."
          }
          inputProps={{ maxLength: 255 }}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={processing || teamName.trim().length < 2}
          >
            <ButtonContent processing={processing} defaultText="Create Team" />
          </Button>
          <Button onClick={handleSkip} disabled={processing}>
            Skip for now
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
