"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import useColorMode from "@/hooks/use-color-mode";
import Link from "next/link";
import * as AuthService from "@/services/auth-service";
import { useRouter } from "next/navigation";

import ToggleColorMode from "@/components/ToggleColorMode";
interface TopBarProps {
  handleSidebarToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ handleSidebarToggle }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const { mode, toggleColorMode } = useColorMode();

  const router = useRouter();

  return (
    <AppBar
      position="fixed"
      sx={{ bgcolor: "background.paper", boxShadow: "none" }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleSidebarToggle}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My Portfolio
        </Typography>

        <ToggleColorMode
          data-screenshot="toggle-mode"
          mode={mode}
          toggleColorMode={toggleColorMode}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleProfileClick}
          >
            <Avatar src="/path-to-avatar.jpg" sx={{ width: 32, height: 32 }} />
            <Typography sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
              John Doe
            </Typography>
            <KeyboardArrowDownIcon />
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem>
            <Link href="/dashboard/user/profile">Update Profile</Link>
          </MenuItem>
          <MenuItem>Change Password</MenuItem>
          <MenuItem>Settings</MenuItem>
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={async () => {
              await AuthService.clearUserStore();
              router.push("/identity/signin");
            }}
          >
            Logout
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
        >
          <MenuItem>New Booking Request</MenuItem>
          <MenuItem>Appointment Reminder</MenuItem>
          <MenuItem>Schedule Update</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
