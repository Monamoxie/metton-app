import { Box, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";

type ErrorProps = {
  title?: string;
  message?: string;
};

export default function SuccessDisplay({ title, message }: ErrorProps) {
  return (
    <Box>
      <Alert severity="success">
        <Typography variant="h5" component="h5">
          {title}
        </Typography>
        <div>{message}</div>
      </Alert>
    </Box>
  );
}
