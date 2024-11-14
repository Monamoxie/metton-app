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

export type HttpMethods = "POST" | "GET" | "PATCH" | "PUT" | "DELETE";

export interface LocalApiRequestProps {
  url: string;
  method: HttpMethods;
  body: object | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponseErrors: Dispatch<SetStateAction<{ [key: string]: string[] }>>;
  setIsFinished: Dispatch<SetStateAction<boolean>>;
  setMessage?: Dispatch<SetStateAction<string>>;
}

export interface AuthApiHeaderResponse {
  [key: string]: string;  
}
