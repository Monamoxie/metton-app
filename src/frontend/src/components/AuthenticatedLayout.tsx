"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";

interface LayoutProps {
  children?: React.ReactNode;
}

const AuthenticatedLayout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  // Guard: if user has no workspaces, send them to the workspace creation flow.
  // Once a workspace exists, if it has no manually created team yet, send them
  // to the team onboarding step. Skip both checks when already on /workspace
  // or /onboarding to avoid a redirect loop (those routes do their own checks).
  useEffect(() => {
    const onOnboardingFlow =
      pathname?.startsWith("/workspace") || pathname?.startsWith("/onboarding");
    if (onOnboardingFlow) {
      setCheckingWorkspaces(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const workspacesResponse = await WorkspaceService.listWorkspaces();
        const workspace = workspacesResponse.data?.workspaces?.[0];
        if (!workspace) {
          if (!cancelled) router.replace("/workspace");
          return;
        }

        const teamsResponse = await TeamService.listTeams(workspace.slug);
        const teams = teamsResponse.data?.teams ?? [];
        const hasManuallyCreatedTeam = teams.some(
          (team: any) => !team.is_default
        );
        if (!cancelled && !hasManuallyCreatedTeam) {
          router.replace("/onboarding/team");
          return;
        }
      } finally {
        if (!cancelled) setCheckingWorkspaces(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checkingWorkspaces) {
    return <CircularProgressBox />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "var(--color-bg-page)",
        color: "var(--color-text-primary)",
      }}
    >
      <TopBar handleSidebarToggle={handleDrawerToggle} />
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          bgcolor: "var(--color-bg-page)",
        }}
      >
        {/* Spacer to push content below the fixed AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AuthenticatedLayout;
