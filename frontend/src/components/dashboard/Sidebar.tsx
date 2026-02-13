import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

interface MenuItem {
  text: string;
  icon: SvgIconComponent;
}

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const menuItems: MenuItem[] = [
  { text: "Home", icon: HomeIcon },
  { text: "Profile", icon: PersonIcon },
  { text: "Messages", icon: ChatIcon },
  { text: "Calendar", icon: CalendarMonthIcon },
  { text: "Schedule", icon: AccessTimeIcon },
  { text: "Settings", icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  handleDrawerToggle,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Rest of the Sidebar code remains the same
  const drawerWidth = expanded ? 240 : 70;

  const drawer = (
    <Box sx={{ overflow: "hidden" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <MenuOpenIcon />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            sx={{
              minHeight: 48,
              px: 2.5,
              justifyContent: expanded ? "initial" : "center",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: expanded ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <item.icon />
            </ListItemIcon>
            {expanded && <ListItemText primary={item.text} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
