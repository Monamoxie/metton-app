"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { mockWorkspaces } from "@/data/mock/workspace";

type SettingsTab = "general" | "members" | "teams" | "billing";

export default function WorkspaceSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const workspace = mockWorkspaces.find((ws) => ws.slug === slug);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "");

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "members", label: "Members" },
    { key: "teams", label: "Teams" },
    { key: "billing", label: "Billing" },
  ];

  if (!workspace) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Workspace not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back link */}
      <Button
        component={Link}
        href={`/workspace/${slug}`}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to workspace
      </Button>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Workspace Settings
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Side nav */}
        <Paper
          variant="outlined"
          sx={{
            width: 200,
            flexShrink: 0,
            alignSelf: "flex-start",
            display: { xs: "none", md: "block" },
          }}
        >
          <List disablePadding>
            {tabs.map((tab) => (
              <ListItemButton
                key={tab.key}
                selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                sx={{ py: 1.5 }}
              >
                <ListItemText
                  primary={tab.label}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: activeTab === tab.key ? 600 : 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        {/* Main content */}
        <Box sx={{ flex: 1, maxWidth: 600 }}>
          {activeTab === "general" && (
            <Box>
              {/* Workspace name */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Workspace name
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, mb: 4 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
                <Button variant="contained" size="small" sx={{ flexShrink: 0 }}>
                  Save
                </Button>
              </Box>

              {/* Workspace logo */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Workspace logo
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 4,
                }}
              >
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: "1.5rem" }}
                >
                  {workspace.name.charAt(0)}
                </Avatar>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small">
                    Change
                  </Button>
                  <Button variant="text" size="small" color="error">
                    Remove
                  </Button>
                </Box>
              </Box>

              {/* Workspace URL */}
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Workspace URL
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                metton.io/{workspace.slug}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Danger zone */}
              <Card
                variant="outlined"
                sx={{ borderColor: "error.main" }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="error" fontWeight={600}>
                    Danger zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    Permanently delete this workspace and all its data. This action
                    cannot be undone.
                  </Typography>
                  <Button variant="outlined" color="error" size="small">
                    Delete workspace
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {activeTab === "members" && (
            <Box>
              <Typography variant="body1" color="text.secondary">
                Manage members from the{" "}
                <Typography
                  component={Link}
                  href={`/workspace/${slug}/members`}
                  color="primary"
                  variant="body1"
                >
                  members page
                </Typography>
                .
              </Typography>
            </Box>
          )}

          {activeTab === "teams" && (
            <Box>
              <Typography variant="body1" color="text.secondary">
                Manage teams from the{" "}
                <Typography
                  component={Link}
                  href={`/workspace/${slug}/teams`}
                  color="primary"
                  variant="body1"
                >
                  teams page
                </Typography>
                .
              </Typography>
            </Box>
          )}

          {activeTab === "billing" && (
            <Box>
              <Typography variant="body1" color="text.secondary">
                Billing settings coming soon.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
