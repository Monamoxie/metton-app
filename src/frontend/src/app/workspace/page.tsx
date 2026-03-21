"use client";

import { useEffect, useMemo, useState } from "react";
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
import { mockUserWorkspaces } from "@/data/mock/workspace";

export default function WorkspaceLandingPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  // null or empty = no workspace list / none selected (create flow)
  const workspaces = useMemo(() => mockUserWorkspaces ?? [], []);

  useEffect(() => {
    if (workspaces.length === 1) {
      router.replace(`/workspace/${workspaces[0].slug}`);
    }
  }, [router, workspaces]);

  const hasNoWorkspaces = workspaces.length === 0;
  const hasMultipleWorkspaces = workspaces.length > 1;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 6 }}>
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
                    <CardHeader
                      title={ws.name}
                      subheader={`${ws.memberCount} members • ${ws.teamCount} teams`}
                    />
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
      />
    </Box>
  );
}

