export interface PairOfStrings {
  [key: string]: string | string[];
}

export interface HandleRecaptchaProps {
  executeRecaptcha: (() => Promise<string>) | undefined;
  setResponseErrors: React.Dispatch<React.SetStateAction<PairOfStrings>>;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}
