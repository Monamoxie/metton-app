"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import * as WorkspaceService from "@/services/workspace-service";

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
  // Skip when already on /workspace to avoid a redirect loop.
  useEffect(() => {
    const onWorkspaceFlow = pathname?.startsWith("/workspace");
    if (onWorkspaceFlow) {
      setCheckingWorkspaces(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await WorkspaceService.listWorkspaces();
        const hasNoWorkspaces =
          response.code !== 200 || response.data.workspaces.length === 0;
        if (!cancelled && hasNoWorkspaces) {
          router.replace("/workspace");
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
