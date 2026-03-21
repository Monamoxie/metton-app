"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Link from "next/link";
import { WorkspaceMember, Team } from "@/types/workspace";
import {
  mockWorkspaces,
  mockMembers,
  mockTeams,
} from "@/data/mock/workspace";
import MembersPreviewTable from "@/components/workspace/MembersPreviewTable";
import TeamsGrid from "@/components/workspace/TeamsGrid";
import InviteMemberDialog from "@/components/workspace/InviteMemberDialog";
import CreateTeamDialog from "@/components/workspace/CreateTeamDialog";
import MemberDetailDrawer from "@/components/workspace/MemberDetailDrawer";

export default function WorkspacePage() {
  const { slug } = useParams<{ slug: string }>();
  const workspace = mockWorkspaces.find((ws) => ws.slug === slug);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );

  const handleMemberClick = (member: WorkspaceMember) => {
    setSelectedMember(member);
  };

  const handleTeamClick = (team: Team) => {
    // Navigate to team detail in the future
  };

  if (!workspace) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Workspace not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* ─── Page Header ─────────────────────────────────────── */}
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
            {workspace.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Chip
              label={`${workspace.memberCount} members`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${workspace.teamCount} teams`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Button
          component={Link}
          href={`/workspace/${slug}/settings`}
          variant="outlined"
          size="small"
          startIcon={<SettingsOutlinedIcon />}
        >
          Settings
        </Button>
      </Box>

      {/* ─── Members Section ─────────────────────────────────── */}
      <Paper variant="outlined" sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Members ({mockMembers.length})
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              href={`/workspace/${slug}/members`}
              variant="text"
              size="small"
            >
              View all
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddAltOutlinedIcon />}
              onClick={() => setInviteOpen(true)}
            >
              Invite
            </Button>
          </Box>
        </Box>
        <Divider />
        <MembersPreviewTable
          members={mockMembers}
          onMemberClick={handleMemberClick}
        />
      </Paper>

      {/* ─── Teams Section ───────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Teams ({mockTeams.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupAddOutlinedIcon />}
            onClick={() => setCreateTeamOpen(true)}
          >
            Create team
          </Button>
        </Box>
        <TeamsGrid teams={mockTeams} onTeamClick={handleTeamClick} />
      </Box>

      {/* ─── Dialogs & Drawers ───────────────────────────────── */}
      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        teams={mockTeams}
      />

      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        existingMembers={mockMembers}
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
