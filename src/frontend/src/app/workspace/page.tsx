"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Grid2 from "@mui/material/Grid";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import CreateWorkspaceDialog from "@/components/workspace/CreateWorkspaceDialog";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import ErrorDisplay from "@/components/ErrorDisplay";
import * as WorkspaceService from "@/services/workspace-service";
import { WorkspaceSummary } from "@/types/workspace";

export default function WorkspaceLandingPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});

  const fetchWorkspaces = async () => {
    setFetchingData(true);
    try {
      const response = await WorkspaceService.listWorkspaces();
      if (response.code === 200) {
        setWorkspaces(response.data.workspaces);
      } else {
        setResponseErrors(response.errors);
      }
    } catch (error: any) {
      setResponseErrors({ error: [error.message] });
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (!fetchingData && workspaces.length === 1) {
      router.replace(`/workspace/${workspaces[0].slug}`);
    }
  }, [fetchingData, router, workspaces]);

  if (fetchingData) {
    return <CircularProgressBox />;
  }

  const hasNoWorkspaces = workspaces.length === 0;
  const hasMultipleWorkspaces = workspaces.length > 1;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 6 }}>
      {Object.keys(responseErrors).length > 0 && (
        <ErrorDisplay errors={responseErrors} />
      )}

      {hasNoWorkspaces && (
        <>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create your first workspace
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Workspaces keep your team&apos;s members, teams and settings
            organised in one place.
          </Typography>

          <Card variant="outlined">
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                You don&apos;t have any workspaces yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a workspace to get started. You can invite team members and
                create teams after this step.
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  onClick={() => setCreateOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Create workspace
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {hasMultipleWorkspaces && (
        <>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Select a workspace
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose which workspace you want to continue with. You can switch
            workspaces later from the profile menu.
          </Typography>

          <Grid2 container spacing={2}>
            {workspaces.map((ws) => (
              <Grid2 key={ws.id} size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined">
                  <CardActionArea
                    onClick={() => router.push(`/workspace/${ws.slug}`)}
                  >
                    <CardHeader title={ws.name} subheader={ws.slug} />
                  </CardActionArea>
                </Card>
              </Grid2>
            ))}
          </Grid2>

          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => setCreateOpen(true)}>
              Create new workspace
            </Button>
          </Box>
        </>
      )}

      <CreateWorkspaceDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(workspace) => router.replace(`/workspace/${workspace.slug}`)}
      />
    </Box>
  );
}

