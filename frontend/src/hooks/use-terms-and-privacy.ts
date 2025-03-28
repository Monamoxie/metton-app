import Link from "@mui/material/Link";
import { useState, useContext } from "react";
import { PlatformSettingsContext } from "@/contexts/base";
import TermsAndPrivacyPolicyNote from "@/components/TermsAndPrivacyPolicyNote";

interface TermsAndPrivacy {
  termsOfService: JSX.Element | null;
  privacyPolicy: JSX.Element | null;
}
export default function useTermsAndPrivacyPolicy(): TermsAndPrivacy {
  const platformSettings = useContext(PlatformSettingsContext);

  if (!platformSettings) {
    return { termsOfService: null, privacyPolicy: null };
  }

  const termsOfService = TermsAndPrivacyPolicyNote(
    platformSettings.has_terms_of_service,
    platformSettings.terms_of_service_url,
    "terms of service"
  );

  const privacyPolicy = TermsAndPrivacyPolicyNote(
    platformSettings.has_privacy_policy,
    platformSettings.privacy_policy_url,
    "privacy policy"
  );

  return { termsOfService, privacyPolicy };
}
