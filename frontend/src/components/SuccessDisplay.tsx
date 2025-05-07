import { AlertTitle, Box, Button, Link, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";

interface ctaButtonProps {
  ctaUrl?: string;
  ctaMessage?: string;
}

interface SuccessDisplayProps extends ctaButtonProps {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

export default function SuccessDisplay(props: SuccessDisplayProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Alert severity="success" sx={{ p: 5 }}>
        {props.title && (
          <AlertTitle>
            <Typography variant="h6" component="h6">
              {props.title}
            </Typography>
          </AlertTitle>
        )}

        {props.message && (
          <Typography sx={{ pt: 2, pb: 4 }} variant="h5" component="h5">
            {props.message}
          </Typography>
        )}

        {props.children && (
          <Typography component="p">{props.children}</Typography>
        )}

        {props.ctaMessage && (
          <CTAButton ctaUrl={props.ctaUrl} ctaMessage={props.ctaMessage} />
        )}
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
