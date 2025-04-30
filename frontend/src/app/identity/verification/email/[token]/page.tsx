import { Card, Container } from "@mui/material";
import EmailVerificationCard from "@/components/identity/verification/email/EmailVerificationCard";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function EmailVerificationPage({ params }: PageProps) {
  return (
    <Container sx={{ pt: 30 }}>
      <Card>
        <EmailVerificationCard token={params.token} />
      </Card>
    </Container>
  );
}
