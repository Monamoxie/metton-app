import PasswordResetCard from "@/components/identity/password-reset/PasswordResetCard";
import { Container } from "@mui/material";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function PasswordResetPage({ params }: PageProps) {
  return (
    <Container sx={{ mt: 15 }}>
      <PasswordResetCard token={params.token} />
    </Container>
  );
}
