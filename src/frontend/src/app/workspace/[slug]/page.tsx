"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { WorkspaceMember, TeamSummary, WorkspaceSummary } from "@/types/workspace";
import { mockTeams } from "@/data/mock/workspace";
import MembersPreviewTable from "@/components/workspace/MembersPreviewTable";
import TeamSummaryGrid from "@/components/workspace/TeamSummaryGrid";
import InviteMemberDialog from "@/components/workspace/InviteMemberDialog";
import CreateTeamDialog from "@/components/workspace/CreateTeamDialog";
import MemberDetailDrawer from "@/components/workspace/MemberDetailDrawer";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";
import * as InvitationService from "@/services/invitation-service";
import { mapToWorkspaceMembers } from "@/utils/workspace-member-mapper";

export default function WorkspacePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null
  );

  const fetchData = useCallback(async () => {
    setFetchingData(true);
    const [workspaceResponse, membersResponse, invitationsResponse, teamsResponse] =
      await Promise.all([
        WorkspaceService.getWorkspace(slug),
        WorkspaceService.listWorkspaceMembers(slug),
        InvitationService.listPendingInvitations(slug),
        TeamService.listTeams(slug),
      ]);

    setWorkspace(workspaceResponse.code === 200 ? workspaceResponse.data.workspace : null);
    setMembers(
      mapToWorkspaceMembers(
        membersResponse.code === 200 ? membersResponse.data.members : [],
        invitationsResponse.code === 200 ? invitationsResponse.data.invitations : []
      )
    );
    setTeams(teamsResponse.code === 200 ? teamsResponse.data.teams : []);
    setFetchingData(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMemberClick = (member: WorkspaceMember) => {
    setSelectedMember(member);
  };

  const handleTeamClick = (team: TeamSummary) => {
    router.push(`/workspace/${slug}/teams/${team.slug}`);
  };

  if (fetchingData) {
    return <CircularProgressBox />;
  }

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
              label={`${members.length} members`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${teams.length} teams`}
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
            Members ({members.length})
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
          members={members}
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
            Teams ({teams.length})
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
        <TeamSummaryGrid teams={teams} onTeamClick={handleTeamClick} />
      </Box>

      {/* ─── Dialogs & Drawers ───────────────────────────────── */}
      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        slug={slug}
        teams={teams}
        onInvited={fetchData}
      />

      <CreateTeamDialog
        open={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        existingMembers={members}
      />

      <MemberDetailDrawer
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        teams={mockTeams}
        slug={slug}
        onRevoked={fetchData}
      />
    </Box>
  );
}
