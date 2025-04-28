import Confetti from "@/components/magicui/confetti";
import { Alert, AlertTitle } from "@mui/material";
import Typography from "@mui/material/Typography";

interface ForgotPasswordCardCompletedProps {
  message?: string;
}

export default function ForgotPasswordCardCompleted({
  message,
}: ForgotPasswordCardCompletedProps): JSX.Element {
  return (
    <>
      <Confetti />
      <Alert sx={{ p: 5 }} severity="success">
        <AlertTitle>
          <h1>Password Reset Request</h1>
        </AlertTitle>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          {message}
        </Typography>
        <Typography sx={{ pt: 2 }} variant="subtitle1" component="p">
          You should receive a reset link shortly. Click on the link to get
          started.
        </Typography>
      </Alert>
    </>
  );
}
