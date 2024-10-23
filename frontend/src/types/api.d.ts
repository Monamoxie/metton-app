type ErrorsField = {
  [key: string]: string | array;
};

export interface ApiResponse {
  message?: string;
  data: Null | Array;
  errors: Null | ErrorsField;
  code: Integer;
}

export interface PasswordResetProps {
  token: string;
  password: string;
  password_confirmation: string;
}

export type VerifyTokenProps = string | undefined;
