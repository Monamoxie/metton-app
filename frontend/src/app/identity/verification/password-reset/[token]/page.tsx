import { verifyPasswordResetToken } from "@/app/api/identity/identity-fetcher";
import ErrorDisplay from "@/components/ErrorDisplay";
import PasswordResetCard from "@/components/identity/PasswordResetCard";
import SuccessDisplay from "@/components/SuccessDisplay";
import { Card, Container } from "@mui/material";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function PasswordResetPage({ params }: PageProps) {
  const token = params.token;
  const response = await verifyPasswordResetToken(token);
  console.log(response);

  return (
    <Container sx={{ pt: 30 }}>
      <Card>
        {response.code !== 200 && <ErrorDisplay errors={response.errors} />}

        {response.code === 200 && <PasswordResetCard />}
      </Card>
    </Container>
  );
}

function passwordResetCard() {}
