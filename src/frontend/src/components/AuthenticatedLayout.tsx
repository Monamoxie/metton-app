"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "@/components/dashboard/Sidebar";
import { mockUserWorkspaces } from "@/data/mock/workspace";

interface LayoutProps {
  children?: React.ReactNode;
}

const AuthenticatedLayout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  // Guard: if user has no workspaces / none selected, send them to workspace flow.
  // Skip when already on /workspace. Swap mockUserWorkspaces for backend data when ready.
  useEffect(() => {
    const onWorkspaceFlow = pathname?.startsWith("/workspace");
    const hasNoWorkspaces =
      mockUserWorkspaces == null || mockUserWorkspaces.length === 0;
    if (!onWorkspaceFlow && hasNoWorkspaces) {
      router.replace("/workspace");
    }
  }, [pathname, router]);

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
