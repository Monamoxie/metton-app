"use client";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import useColorMode from "@/hooks/use-color-mode";
import * as AuthService from "@/services/auth-service";
import { useRouter } from "next/navigation";
import ToggleColorMode from "@/components/ToggleColorMode";
import CreateWorkspaceDialog from "@/components/workspace/CreateWorkspaceDialog";
import { mockWorkspaces, currentWorkspace } from "@/data/mock/workspace";

interface TopBarProps {
  handleSidebarToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ handleSidebarToggle }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const closeProfileMenu = () => setAnchorEl(null);

  const { mode, toggleColorMode } = useColorMode();
  const router = useRouter();

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: "background.paper",
          boxShadow: "none",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
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

          <Box
            component="a"
            href="/"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              ml: { xs: 1, sm: 5 },
            }}
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="Metton"
              sx={{ width: 125, height: 55 }}
            />
          </Box>

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
              <Avatar
                src="/path-to-avatar.jpg"
                sx={{ width: 32, height: 32 }}
              />
              <Typography
                sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
              >
                John Doe
              </Typography>
              <KeyboardArrowDownIcon />
            </Box>
          </Box>

          {/* ─── Profile Menu (with workspaces) ─────────────── */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeProfileMenu}
            slotProps={{ paper: { sx: { minWidth: 240 } } }}
          >
            {/* Account section */}
            <MenuItem
              onClick={() => {
                closeProfileMenu();
                router.push("/identity/user/profile");
              }}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update Profile</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeProfileMenu();
                router.push("/identity/user/password-update");
              }}
            >
              <ListItemIcon>
                <LockOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update Password</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                closeProfileMenu();
                // TODO: navigate to settings
              }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>

            <Divider />

            {/* Workspaces section */}
            <MenuItem disabled sx={{ opacity: 1, minHeight: "auto", py: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                Workspaces
              </Typography>
            </MenuItem>

            {mockWorkspaces.map((ws) => (
              <MenuItem
                key={ws.id}
                onClick={() => {
                  closeProfileMenu();
                  router.push(`/workspace/${ws.slug}`);
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      bgcolor:
                        ws.id === currentWorkspace.id
                          ? "primary.main"
                          : "grey.400",
                    }}
                  >
                    {ws.name.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText>{ws.name}</ListItemText>
                {ws.id === currentWorkspace.id && (
                  <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                )}
              </MenuItem>
            ))}

            <MenuItem
              onClick={() => {
                closeProfileMenu();
                setCreateWsOpen(true);
              }}
            >
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create new workspace</ListItemText>
            </MenuItem>

            <Divider />

            {/* Logout */}
            <MenuItem
              sx={{ color: "error.main" }}
              onClick={async () => {
                closeProfileMenu();
                await AuthService.clearUserSession();
                router.push("/identity/signin");
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* ─── Notifications Menu ─────────────────────────── */}
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

      {/* ─── Create Workspace Dialog ──────────────────────── */}
      <CreateWorkspaceDialog
        open={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
      />
    </>
  );
};

export default TopBar;
