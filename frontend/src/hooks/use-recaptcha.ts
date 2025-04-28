import { hasRecaptcha } from "@/utils/utils";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useMemo } from "react";

export default function useRecaptcha(action: null | string = null) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleRecaptcha = useMemo(() => {
    return async (): Promise<string | null> => {
      if (!hasRecaptcha()) {
        return null;
      }

      if (!executeRecaptcha) {
        throw new Error("Google ReCaptcha has not been properly initialized.");
      }

      try {
        const token = await executeRecaptcha(action || undefined);
        return token;
      } catch (error) {
        throw new Error("Failed to execute ReCaptcha. Please try again.");
      }
    };
  }, [executeRecaptcha, action]);

  return { handleRecaptcha };
}
