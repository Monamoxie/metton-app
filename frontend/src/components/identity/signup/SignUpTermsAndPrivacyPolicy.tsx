import useTermsAndPrivacyPolicy from "@/hooks/use-terms-and-privacy";
import { Typography } from "@mui/material";

// Form terms and privacy policy notification and link
const SignUpTermsAndPrivacyPolicy = (): JSX.Element | null => {
  const { termsOfService, privacyPolicy } = useTermsAndPrivacyPolicy();

  if (!termsOfService && !privacyPolicy) return null;

  return (
    <Typography variant="body2" sx={{ marginTop: 2 }}>
      By signing up, you agree to our {termsOfService}
      {termsOfService && privacyPolicy && " and "}
      {privacyPolicy}.
    </Typography>
  );
};
export default SignUpTermsAndPrivacyPolicy;
