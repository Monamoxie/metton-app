import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CodeIcon from "@mui/icons-material/Code";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

export const SIDEBAR_EXPANDED_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 70;

interface MenuItem {
  text: string;
  icon: SvgIconComponent;
  href: string;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export const menuSections: MenuSection[] = [
  {
    label: "Main",
    items: [
      { text: "Dashboard", icon: DashboardOutlinedIcon, href: "/dashboard" },
      { text: "Calendar", icon: CalendarMonthIcon, href: "/calendar" },
      { text: "Event Types", icon: CategoryOutlinedIcon, href: "/event-types" },
      { text: "Guests", icon: PeopleOutlineIcon, href: "/guests" },
      { text: "Notifications", icon: NotificationsOutlinedIcon, href: "/notifications" },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { text: "Availability", icon: AccessTimeIcon, href: "/identity/user/availability" },
      { text: "Team & Routing", icon: CallSplitIcon, href: "/team-routing" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { text: "Team", icon: GroupsOutlinedIcon, href: "/workspace" },
      { text: "Analytics", icon: BarChartIcon, href: "/analytics" },
      { text: "Invoices", icon: ReceiptLongOutlinedIcon, href: "/invoices" },
    ],
  },
  {
    label: "Growth",
    items: [
      { text: "Storefront", icon: StorefrontOutlinedIcon, href: "/storefront" },
      { text: "Bots & Messaging", icon: SmartToyOutlinedIcon, href: "/bots-messaging" },
      { text: "AI Assist", icon: AutoAwesomeOutlinedIcon, href: "/ai-assist" },
    ],
  },
  {
    label: "Developer",
    items: [{ text: "API & Developer", icon: CodeIcon, href: "/developer" }],
  },
  {
    label: "Settings",
    items: [{ text: "Settings", icon: SettingsIcon, href: "/settings" }],
  },
];

const isItemActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`);

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  handleDrawerToggle,
}) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();

  const drawerWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const handleItemClick = () => {
    if (isMobile && mobileOpen) {
      handleDrawerToggle();
    }
  };

  const drawer = (
    <Box sx={{ overflow: "hidden" }}>
      {/* Spacer so sidebar content starts below the AppBar */}
      <Toolbar />
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <MenuOpenIcon
            sx={{
              transform: expanded ? "none" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          />
        </IconButton>
      </Box>
      {menuSections.map((section) => (
        <Box key={section.label} sx={{ mb: 1 }}>
          {expanded && (
            <Typography
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 0.5,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {section.label}
            </Typography>
          )}
          <List disablePadding>
            {section.items.map((item) => {
              const active = isItemActive(pathname ?? "", item.href);
              return (
                <ListItemButton
                  key={item.text}
                  component={Link}
                  href={item.href}
                  selected={active}
                  onClick={handleItemClick}
                  sx={{
                    minHeight: 44,
                    px: 2.5,
                    justifyContent: expanded ? "initial" : "center",
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      color: "primary.main",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: expanded ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={item.text}
                      slotProps={{
                        primary: { fontSize: 14, fontWeight: active ? 500 : 400 },
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
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
              width: SIDEBAR_EXPANDED_WIDTH,
              boxSizing: "border-box",
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
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
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
