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
import { TeamSummary, WorkspaceMember, WorkspaceRole } from "@/types/workspace";
import { useState, useEffect } from "react";
import * as InvitationService from "@/services/invitation-service";
import * as WorkspaceService from "@/services/workspace-service";
import ButtonContent from "@/components/ButtonContent";

interface MemberDetailDrawerProps {
  member: WorkspaceMember | null;
  open: boolean;
  onClose: () => void;
  teams: TeamSummary[];
  slug: string;
  onRevoked?: () => void;
  onMemberUpdated?: () => void;
}

export default function MemberDetailDrawer({
  member,
  open,
  onClose,
  teams,
  slug,
  onRevoked,
  onMemberUpdated,
}: MemberDetailDrawerProps) {
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [teamId, setTeamId] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setTeamId(member.teamId || "");
      setRevokeError(null);
      setUpdateError(null);
    }
  }, [member]);

  if (!member) return null;

  const hasChanges =
    role !== member.role || teamId !== (member.teamId || "");

  const handleUpdate = async () => {
    const payload: { role?: string; team_slug?: string } = {};
    if (role !== member.role) payload.role = role;
    if (teamId !== (member.teamId || "")) payload.team_slug = teamId;

    setSaving(true);
    setUpdateError(null);
    try {
      const response = await WorkspaceService.updateMember(
        slug,
        member.id,
        payload
      );

      if (response.code !== 200) {
        setUpdateError(response.message || "Unable to update this member.");
        return;
      }

      onMemberUpdated?.();
    } finally {
      setSaving(false);
    }
  };

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
          disabled={member.role === "owner" || isPending}
        >
          <MenuItem value="owner" disabled>
            Owner
          </MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
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
            <MenuItem key={team.slug} value={team.slug}>
              {team.name}
              {team.is_default && " (default)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        onClick={handleUpdate}
        disabled={!hasChanges || saving || isPending}
      >
        <ButtonContent processing={saving} defaultText="Update" />
      </Button>

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
