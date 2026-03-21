"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import Link from "next/link";
import { mockTeams, mockMembers } from "@/data/mock/workspace";

export default function TeamDetailPage() {
  const { slug, teamId } = useParams<{ slug: string; teamId: string }>();

  const team = mockTeams.find((t) => t.id === teamId);
  const teamMembers = mockMembers.filter((m) => m.teamId === teamId);

  const [editing, setEditing] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || "");
  const [teamDescription, setTeamDescription] = useState(team?.description || "");

  if (!team) {
    return (
      <Box>
        <Button
          component={Link}
          href={`/workspace/${slug}/teams`}
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ mb: 2 }}
        >
          Back to teams
        </Button>
        <Typography variant="h6" color="text.secondary">
          Team not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back link */}
      <Button
        component={Link}
        href={`/workspace/${slug}/teams`}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to teams
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          {editing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                size="small"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                label="Team name"
              />
              <TextField
                size="small"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                label="Description"
                multiline
                minRows={2}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setEditing(false)}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setTeamName(team.name);
                    setTeamDescription(team.description);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h5" fontWeight={700}>
                  {team.name}
                </Typography>
                {team.isDefault && (
                  <Chip label="default" size="small" color="info" variant="outlined" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {team.description}
              </Typography>
            </Box>
          )}
        </Box>
        {!editing && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Team members */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Members ({teamMembers.length})
      </Typography>

      {teamMembers.length > 0 ? (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.875rem",
                            bgcolor: "primary.main",
                          }}
                        >
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.role}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {member.role !== "owner" && (
                        <IconButton size="small" color="error">
                          <PersonRemoveOutlinedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{ py: 6, textAlign: "center" }}
        >
          <Typography variant="body2" color="text.secondary">
            No members in this team yet.
          </Typography>
        </Paper>
      )}

      {/* Danger zone for non-default teams */}
      {!team.isDefault && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Button variant="outlined" color="error" size="small">
            Delete team
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Members will be moved to the default team.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
