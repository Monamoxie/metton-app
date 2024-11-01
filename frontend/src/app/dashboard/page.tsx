"use client";

import Grid2 from "@mui/material/Grid2";
import ProjectsSection from "../../components/dashboard/ProjectsSection";
import AppointmentsSection from "../../components/dashboard/AppointmentsSection";

export default function DashboardPage() {
  return (
    <Grid2 container spacing={{ xs: 12, md: 3 }}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <ProjectsSection />
      </Grid2>
      <Grid2 size={{ xs: 12, md: 4 }}>
        <AppointmentsSection />
      </Grid2>
    </Grid2>
  );
}
