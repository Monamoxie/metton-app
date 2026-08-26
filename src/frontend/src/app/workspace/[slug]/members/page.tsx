"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "next/link";
import { WorkspaceMember, WorkspaceRole, InviteStatus, TeamSummary } from "@/types/workspace";
import { mockTeams } from "@/data/mock/workspace";
import MembersPreviewTable from "@/components/workspace/MembersPreviewTable";
import MemberDetailDrawer from "@/components/workspace/MemberDetailDrawer";
import InviteMemberDialog from "@/components/workspace/InviteMemberDialog";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";
import * as InvitationService from "@/services/invitation-service";

export default function WorkspaceMembersPage() {
  const { slug } = useParams<{ slug: string }>();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<WorkspaceRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<InviteStatus | "all">("all");

  const fetchData = useCallback(async () => {
    const [membersResponse, invitationsResponse, teamsResponse] = await Promise.all([
      WorkspaceService.listWorkspaceMembers(slug),
      InvitationService.listPendingInvitations(slug),
      TeamService.listTeams(slug),
    ]);

    const activeMembers: WorkspaceMember[] =
      membersResponse.code === 200
        ? membersResponse.data.members.map((m: any) => ({
            id: m.user.public_id,
            name: m.user.name,
            email: m.user.email,
            avatar: "",
            role: m.role.toLowerCase() as WorkspaceRole,
            status: "active" as InviteStatus,
            teamId: null,
            teamName: null,
            joinedAt: m.created_at,
          }))
        : [];

    const pendingMembers: WorkspaceMember[] =
      invitationsResponse.code === 200
        ? invitationsResponse.data.invitations.map((i: any) => ({
            id: `invite-${i.email}`,
            name: "",
            email: i.email,
            avatar: "",
            role: i.role.toLowerCase() as WorkspaceRole,
            status: "pending" as InviteStatus,
            teamId: null,
            teamName: i.team || null,
            joinedAt: null,
          }))
        : [];

    setMembers([...activeMembers, ...pendingMembers]);
    setTeams(teamsResponse.code === 200 ? teamsResponse.data.teams : []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

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
          <Typography variant="h5" fontWeight={700}>
            Members
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Chip label={`${activeCount} active`} size="small" color="success" variant="outlined" />
            <Chip label={`${pendingCount} pending`} size="small" color="warning" variant="outlined" />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={() => setInviteOpen(true)}
        >
          Invite
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            label="Role"
            onChange={(e) => setRoleFilter(e.target.value as WorkspaceRole | "all")}
          >
            <MenuItem value="all">All roles</MenuItem>
            <MenuItem value="owner">Owner</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as InviteStatus | "all")}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Paper variant="outlined">
        <MembersPreviewTable
          members={filteredMembers}
          onMemberClick={setSelectedMember}
        />
        {!loading && filteredMembers.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No members found matching your filters.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialogs & Drawers */}
      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        slug={slug}
        teams={teams}
        onInvited={fetchData}
      />
      <MemberDetailDrawer
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        teams={mockTeams}
      />
    </Box>
  );
}
