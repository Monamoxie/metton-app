import { verifyToken } from "@/app/api/identity/identity-fetcher";
import ErrorDisplay from "@/components/ErrorDisplay";
import SuccessDisplay from "@/components/SuccessDisplay";
import { Card, Container } from "@mui/material";

type PageProps = {
  params: {
    token?: string;
  };
};

export default async function EmailVerificationPage({ params }: PageProps) {
  const token = params.token;
  const response = await verifyToken(token);

  return (
    <Container sx={{ pt: 30 }}>
      <Card>
        {response.code !== 200 && <ErrorDisplay errors={response.errors} />}

        {response.code === 200 && <SuccessDisplay title={response.message} />}
      </Card>
    </Container>
  );
}
