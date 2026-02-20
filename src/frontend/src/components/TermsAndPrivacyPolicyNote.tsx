import { Link } from "@mui/material";

export default function TermsAndPrivacyPolicyNote(
  hasItem: boolean,
  url: string | null,
  text: string
): React.JSX.Element | null {
  if (!hasItem || !url) return null;

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      {text}
    </Link>
  );
}
