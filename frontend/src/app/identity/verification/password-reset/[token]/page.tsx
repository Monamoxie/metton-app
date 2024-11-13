import { verifyPasswordResetToken } from "@/data/outbound/identity-fetcher";
import ErrorDisplay from "@/components/ErrorDisplay";
import PasswordResetCard from "@/components/identity/PasswordResetCard";
import SuccessDisplay from "@/components/SuccessDisplay";
import { Box, Card, Container } from "@mui/material";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function PasswordResetPage({ params }: PageProps) {
  const token = params.token;
  const response = await verifyPasswordResetToken(token);

  return (
    <Container sx={{ mt: 15 }}>
      {response.code !== 200 && (
        <Box sx={{ mt: 25 }}>
          <ErrorDisplay errors={response.errors} />
        </Box>
      )}

      {response.code === 200 && (
        <Card>
          <PasswordResetCard token={token} />
        </Card>
      )}
    </Container>
  );
}
