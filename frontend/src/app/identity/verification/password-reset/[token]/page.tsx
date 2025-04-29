import PasswordResetCard from "@/components/identity/password-reset/PasswordResetCard";
import { Card, Container } from "@mui/material";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function PasswordResetPage({ params }: PageProps) {
  return (
    <Container sx={{ mt: 15 }}>
      <Card>
        <PasswordResetCard token={params.token} />
      </Card>
    </Container>
  );
}
