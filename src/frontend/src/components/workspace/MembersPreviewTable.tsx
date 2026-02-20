"use client";

import {
  Avatar,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { WorkspaceMember } from "@/types/workspace";

interface MembersPreviewTableProps {
  members: WorkspaceMember[];
  onMemberClick: (member: WorkspaceMember) => void;
}

const roleColor: Record<string, "primary" | "secondary" | "default"> = {
  owner: "primary",
  admin: "secondary",
  member: "default",
};

export default function MembersPreviewTable({
  members,
  onMemberClick,
}: MembersPreviewTableProps) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow
              key={member.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => onMemberClick(member)}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={member.avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      bgcolor: member.status === "pending" ? "grey.400" : "primary.main",
                    }}
                  >
                    {(member.name || member.email).charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {member.name || "—"}
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
                  color={roleColor[member.role] || "default"}
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {member.teamName || "—"}
                </Typography>
              </TableCell>
              <TableCell>
                {member.status === "pending" ? (
                  <Chip label="Pending" size="small" color="warning" variant="outlined" />
                ) : (
                  <Chip label="Active" size="small" color="success" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
