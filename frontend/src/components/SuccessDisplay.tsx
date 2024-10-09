import { Box, Button, Link, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";

interface ctaButtonProps {
  ctaUrl?: string;
  ctaMessage?: string;
}

interface SuccessDisplayProps extends ctaButtonProps {
  title?: string;
  message?: string;
}

export default function SuccessDisplay(props: SuccessDisplayProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="success">
        <Typography variant="h6" component="h6">
          {props.title}
        </Typography>
        <Box sx={{ mb: 4 }}>{props.message}</Box>
        <CTAButton ctaUrl={props.ctaUrl} ctaMessage={props.ctaMessage} />
      </Alert>
    </Box>
  );
}

function CTAButton({ ctaUrl, ctaMessage }: ctaButtonProps) {
  return (
    <Link href={ctaUrl}>
      <Button type="button" variant="contained">
        {ctaMessage}
      </Button>
    </Link>
  );
}
