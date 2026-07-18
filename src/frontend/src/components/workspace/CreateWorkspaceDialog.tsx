"use client";

import { useState } from "react";
import {
  Alert,
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
import * as WorkspaceService from "@/services/workspace-service";
import { WorkspaceSummary } from "@/types/workspace";
import ButtonContent from "@/components/ButtonContent";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (workspace: WorkspaceSummary) => void;
}

export default function CreateWorkspaceDialog({
  open,
  onClose,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!workspaceName.trim()) return;

    setProcessing(true);
    setErrorMessage(null);
    try {
      const response = await WorkspaceService.createWorkspace({
        name: workspaceName.trim(),
      });

      if (response.code !== 201) {
        setErrorMessage(response.message || "Unable to create workspace.");
        return;
      }

      onCreated?.(response.data.workspace as WorkspaceSummary);
      setWorkspaceName("");
      onClose();
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setWorkspaceName("");
    setErrorMessage(null);
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
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <TextField
          label="Workspace name"
          placeholder="e.g. Acme Corp, My Company"
          fullWidth
          size="small"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          error={workspaceName.length > 0 && workspaceName.trim().length < 2}
          helperText={
            workspaceName.length > 0 && workspaceName.trim().length < 2
              ? "Workspace name must be at least 2 characters."
              : ""
          }
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
        <Button onClick={handleClose} disabled={processing}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={processing || workspaceName.trim().length < 2}
        >
          <ButtonContent
            processing={processing}
            defaultText="Create workspace"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
