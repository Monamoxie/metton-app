"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { TeamMembershipSummary, TeamSummary } from "@/types/workspace";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import * as TeamService from "@/services/team-service";

export default function TeamDetailPage() {
  const { slug, teamSlug } = useParams<{ slug: string; teamSlug: string }>();
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [members, setMembers] = useState<TeamMembershipSummary[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchTeamAndMembers = async () => {
      setFetchingData(true);

      const teamsResponse = await TeamService.listTeams(slug);
      const teams: TeamSummary[] =
        teamsResponse.code === 200 ? teamsResponse.data.teams : [];
      const matchedTeam = teams.find((t) => t.slug === teamSlug) || null;
      setTeam(matchedTeam);

      if (matchedTeam) {
        const membersResponse = await TeamService.getTeamMembers(slug, teamSlug);
        setMembers(membersResponse.code === 200 ? membersResponse.data.members : []);
      }

      setFetchingData(false);
    };

    fetchTeamAndMembers();
  }, [slug, teamSlug]);

  if (fetchingData) {
    return <CircularProgressBox />;
  }

  if (!team) {
    return (
      <Box>
        <Button
          component={Link}
          href={`/workspace/${slug}/teams`}
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ mb: 2 }}
        >
          Back to teams
        </Button>
        <Typography variant="h6" color="text.secondary">
          Team not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back link */}
      <Button
        component={Link}
        href={`/workspace/${slug}/teams`}
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to teams
      </Button>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {team.name}
        </Typography>
        {team.is_default && (
          <Chip label="default" size="small" color="info" variant="outlined" />
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Team members */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Members ({members.length})
      </Typography>

      {members.length > 0 ? (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((membership) => (
                  <TableRow key={membership.user.public_id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.875rem",
                            bgcolor: "primary.main",
                          }}
                        >
                          {(membership.user.name || membership.user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {membership.user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {membership.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={membership.role}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No members in this team yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
