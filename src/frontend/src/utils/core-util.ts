export function hasRecaptcha(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_HAS_GOOGLE_RECAPTCHA &&
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  );
}

export function getRecaptchaKey(): string {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
}
