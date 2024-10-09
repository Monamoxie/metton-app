type ErrorsField = {
  [key: string]: string | array;
};

export interface ApiResponse {
  message?: string;
  data: Null | Array;
  errors: Null | ErrorsField;
  code: Integer;
}
