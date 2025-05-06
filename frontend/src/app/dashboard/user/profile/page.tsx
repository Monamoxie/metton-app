import UserProfileCard from "@/components/dashboard/user/profile/UserProfileCard";
import { Card, Container } from "@mui/material";

export default function ProfilePage() {
  return (
    <Container>
      <Card>
        <UserProfileCard />
      </Card>
    </Container>
  );
}
