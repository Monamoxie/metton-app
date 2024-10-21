import { CircularProgress } from "@mui/material";

interface ButtonContentProps {
  processing: boolean;
  defaultText: string;
}
export default function ButtonContent({
  processing,
  defaultText,
}: ButtonContentProps): JSX.Element | string {
  if (processing) {
    return <CircularProgress size={22} sx={{ color: "#fff" }} />;
  }
  return defaultText;
}
