"use client";

import { useState } from "react";
import {
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
import { Team, WorkspaceRole } from "@/types/workspace";

interface PendingInvite {
  email: string;
  role: WorkspaceRole;
}

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  teams: Team[];
}

export default function InviteMemberDialog({
  open,
  onClose,
  teams,
}: InviteMemberDialogProps) {
  const [emailInput, setEmailInput] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [selectedTeam, setSelectedTeam] = useState(
    teams.find((t) => t.isDefault)?.id || ""
  );

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

  const handleRoleChange = (email: string, role: WorkspaceRole) => {
    setPendingInvites(
      pendingInvites.map((i) => (i.email === email ? { ...i, role } : i))
    );
  };

  const handleSend = () => {
    // TODO: send invitations to backend
    setPendingInvites([]);
    setEmailInput("");
    onClose();
  };

  const handleClose = () => {
    setPendingInvites([]);
    setEmailInput("");
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
                        handleRoleChange(invite.email, e.target.value as WorkspaceRole)
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
              <MenuItem key={team.id} value={team.id}>
                {team.name}
                {team.isDefault && (
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={pendingInvites.length === 0}
        >
          Send {pendingInvites.length > 0 ? `(${pendingInvites.length})` : ""}{" "}
          invitation{pendingInvites.length !== 1 ? "s" : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
