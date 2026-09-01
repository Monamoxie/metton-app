"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Team, WorkspaceMember, WorkspaceRole } from "@/types/workspace";
import { mockWorkspaces } from "@/data/mock/workspace";
import { useState, useEffect } from "react";
import * as InvitationService from "@/services/invitation-service";
import ButtonContent from "@/components/ButtonContent";

interface MemberDetailDrawerProps {
  member: WorkspaceMember | null;
  open: boolean;
  onClose: () => void;
  teams: Team[];
  slug: string;
  onRevoked?: () => void;
}

export default function MemberDetailDrawer({
  member,
  open,
  onClose,
  teams,
  slug,
  onRevoked,
}: MemberDetailDrawerProps) {
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [teamId, setTeamId] = useState("");
  const [workspaceId, setWorkspaceId] = useState(mockWorkspaces[0]?.id || "");
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setTeamId(member.teamId || "");
      setRevokeError(null);
    }
  }, [member]);

  if (!member) return null;

  const handleRevoke = async () => {
    if (!member.invitationId) return;

    setRevoking(true);
    setRevokeError(null);
    try {
      const response = await InvitationService.revokeInvitation(
        slug,
        member.invitationId
      );

      if (response.code !== 200) {
        setRevokeError(response.message || "Unable to revoke this invitation.");
        return;
      }

      onRevoked?.();
      onClose();
    } finally {
      setRevoking(false);
    }
  };

  const isPending = member.status === "pending";
  const displayName = member.name || member.email;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 380 }, p: 3 } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={member.avatar}
            sx={{
              width: 48,
              height: 48,
              bgcolor: isPending ? "grey.400" : "primary.main",
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {member.name || "Invited user"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {member.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {isPending && (
        <Chip
          label="Invitation pending"
          color="warning"
          variant="outlined"
          size="small"
          sx={{ mb: 3 }}
        />
      )}

      {/* Role */}
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={role}
          label="Role"
          onChange={(e) => setRole(e.target.value as WorkspaceRole)}
          disabled={member.role === "owner"}
        >
          <MenuItem value="owner" disabled>
            Owner
          </MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="member">Member</MenuItem>
        </Select>
      </FormControl>

      {/* Team */}
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <InputLabel>Team</InputLabel>
        <Select
          value={teamId}
          label="Team"
          onChange={(e) => setTeamId(e.target.value)}
          disabled={isPending}
        >
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
              {team.isDefault && " (default)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Workspace (move to another workspace) */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Workspace</InputLabel>
        <Select
          value={workspaceId}
          label="Workspace"
          onChange={(e) => setWorkspaceId(e.target.value)}
          disabled={member.role === "owner"}
        >
          {mockWorkspaces.map((ws) => (
            <MenuItem key={ws.id} value={ws.id}>
              {ws.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Meta info */}
      <Typography variant="caption" color="text.secondary">
        Joined: {formatDate(member.joinedAt)}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Danger zone */}
      {member.role !== "owner" && (
        <Box>
          {revokeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {revokeError}
            </Alert>
          )}
          {isPending ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              size="small"
              onClick={handleRevoke}
              disabled={revoking}
            >
              <ButtonContent processing={revoking} defaultText="Revoke invitation" />
            </Button>
          ) : (
            <Button variant="outlined" color="error" fullWidth size="small">
              Remove from workspace
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
}
