import AvailabilityCard from "@/components/identity/user/availability/AvailabilityCard";
import { Container, Typography } from "@mui/material";

export default function AvailabilityPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Availability
      </Typography>
      <AvailabilityCard />
    </Container>
  );
}
