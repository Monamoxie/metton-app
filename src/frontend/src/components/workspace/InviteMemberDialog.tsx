"use client";

import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TeamSummary } from "@/types/workspace";
import * as InvitationService from "@/services/invitation-service";
import ButtonContent from "@/components/ButtonContent";

type InviteRole = "admin" | "member";

interface PendingInvite {
  email: string;
  role: InviteRole;
}

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  teams: TeamSummary[];
  onInvited?: () => void;
}

export default function InviteMemberDialog({
  open,
  onClose,
  slug,
  teams,
  onInvited,
}: InviteMemberDialogProps) {
  const [emailInput, setEmailInput] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [selectedTeam, setSelectedTeam] = useState(
    teams.find((t) => t.is_default)?.slug || ""
  );
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (pendingInvites.some((i) => i.email === trimmed)) return;
    setPendingInvites([...pendingInvites, { email: trimmed, role: "member" }]);
    setEmailInput("");
  };

  const handleRemoveInvite = (email: string) => {
    setPendingInvites(pendingInvites.filter((i) => i.email !== email));
  };

  const handleRoleChange = (email: string, role: InviteRole) => {
    setPendingInvites(
      pendingInvites.map((i) => (i.email === email ? { ...i, role } : i))
    );
  };

  const handleSend = async () => {
    if (pendingInvites.length === 0) return;

    setProcessing(true);
    setErrorMessage(null);
    try {
      const response = await InvitationService.inviteMembers(
        slug,
        pendingInvites,
        selectedTeam || undefined
      );

      if (response.code !== 201) {
        setErrorMessage(response.message || "Unable to send invitations.");
        return;
      }

      onInvited?.();
      setPendingInvites([]);
      setEmailInput("");
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setPendingInvites([]);
    setEmailInput("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Invite members
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {/* Email input */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            label="Email address"
            placeholder="colleague@company.com"
            size="small"
            fullWidth
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddEmail();
              }
            }}
          />
          <Button variant="outlined" onClick={handleAddEmail} sx={{ flexShrink: 0 }}>
            Add
          </Button>
        </Box>

        {/* Pending invites list */}
        {pendingInvites.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Pending invites
            </Typography>
            <List dense disablePadding>
              {pendingInvites.map((invite) => (
                <ListItem
                  key={invite.email}
                  disableGutters
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveInvite(invite.email)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                      {invite.email.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={invite.email}
                    primaryTypographyProps={{ variant: "body2" }}
                  />
                  <FormControl size="small" sx={{ minWidth: 100, mr: 4 }}>
                    <Select
                      value={invite.role}
                      onChange={(e) =>
                        handleRoleChange(invite.email, e.target.value as InviteRole)
                      }
                      variant="standard"
                    >
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Team selector */}
        <FormControl fullWidth size="small">
          <InputLabel>Assign to team (optional)</InputLabel>
          <Select
            value={selectedTeam}
            label="Assign to team (optional)"
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map((team) => (
              <MenuItem key={team.slug} value={team.slug}>
                {team.name}
                {team.is_default && (
                  <Chip
                    label="default"
                    size="small"
                    sx={{ ml: 1 }}
                    color="info"
                    variant="outlined"
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={processing || pendingInvites.length === 0}
        >
          <ButtonContent
            processing={processing}
            defaultText={`Send ${pendingInvites.length > 0 ? `(${pendingInvites.length})` : ""} invitation${pendingInvites.length !== 1 ? "s" : ""}`}
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
