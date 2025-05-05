import UserProfileCard from "@/components/dashboard/user/profile/UserProfileCard";
import { Card, Container } from "@mui/material";

export default async function ProfilePage() {
  return (
    <Container>
      <Card>
        <UserProfileCard />
      </Card>
    </Container>
  );
}
