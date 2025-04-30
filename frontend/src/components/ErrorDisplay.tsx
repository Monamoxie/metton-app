import { AlertTitle, Box, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";

type ErrorProps = {
  errors: {
    [key: string]: string | string[];
  };
  message?: string;
};

export default function ErrorDisplay({ errors, message }: ErrorProps) {
  return (
    <Box sx={{ mb: 5 }}>
      {Object.keys(errors).map((key) => (
        <Alert severity="error" key={key}>
          <AlertTitle>
            <Typography variant="h6" component="h6">
              {message}{" "}
            </Typography>
          </AlertTitle>
          {Array.isArray(errors[key])
            ? errors[key].map((msg, index) => <div key={index}>{msg}</div>)
            : errors[key]}
        </Alert>
      ))}
    </Box>
  );
}
