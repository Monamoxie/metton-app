import PasswordUpdateForm from "@/components/identity/password-update/PasswordUpdateForm";
import { Card, Container } from "@mui/material";

export default function PasswordUpdatePage() {
  return (
    <Container>
      <Card sx={{ mt: 10 }}>
        <PasswordUpdateForm />
      </Card>
    </Container>
  );
}
