"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceDialog({
  open,
  onClose,
}: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState("");

  const handleCreate = () => {
    // TODO: send to backend
    setWorkspaceName("");
    onClose();
  };

  const handleClose = () => {
    setWorkspaceName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create workspace
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          label="Workspace name"
          placeholder="e.g. Acme Corp, My Company"
          fullWidth
          size="small"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Logo (optional)
        </Typography>
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            p: 3,
            textAlign: "center",
            mb: 3,
            cursor: "pointer",
            "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: "text.secondary", mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Click to upload or drag and drop
          </Typography>
          <Typography variant="caption" color="text.disabled">
            PNG, JPG up to 2MB
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          A default team named &quot;General&quot; will be created automatically.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!workspaceName.trim()}
        >
          Create workspace
        </Button>
      </DialogActions>
    </Dialog>
  );
}
