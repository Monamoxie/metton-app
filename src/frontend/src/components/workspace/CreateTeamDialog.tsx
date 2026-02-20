"use client";

import { useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { WorkspaceMember } from "@/types/workspace";

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  existingMembers: WorkspaceMember[];
}

export default function CreateTeamDialog({
  open,
  onClose,
  existingMembers,
}: CreateTeamDialogProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<WorkspaceMember[]>([]);

  const activeMembers = existingMembers.filter((m) => m.status === "active");

  const handleCreate = () => {
    // TODO: send to backend
    setTeamName("");
    setDescription("");
    setSelectedMembers([]);
    onClose();
  };

  const handleClose = () => {
    setTeamName("");
    setDescription("");
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create team
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          label="Team name"
          placeholder="e.g. Engineering, Marketing"
          fullWidth
          size="small"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          sx={{ mb: 2.5 }}
        />

        <TextField
          label="Description (optional)"
          placeholder="What does this team do?"
          fullWidth
          size="small"
          multiline
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2.5 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Add members (optional)
        </Typography>

        <Autocomplete
          multiple
          options={activeMembers}
          value={selectedMembers}
          onChange={(_, value) => setSelectedMembers(value)}
          getOptionLabel={(option) => option.name || option.email}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} placeholder="Search members..." size="small" />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <Box
                component="li"
                key={key}
                {...rest}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                  {(option.name || option.email).charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2">{option.name || option.email}</Typography>
                  {option.name && (
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((member, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={member.name || member.email}
                  size="small"
                  avatar={
                    <Avatar sx={{ width: 20, height: 20, fontSize: "0.625rem" }}>
                      {(member.name || member.email).charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  {...tagProps}
                />
              );
            })
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!teamName.trim()}
        >
          Create team
        </Button>
      </DialogActions>
    </Dialog>
  );
}
