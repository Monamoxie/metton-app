type ErrorsField = {
  [key: string]: string | array;
};

export default interface ApiResponse {
  message?: string;
  data: Null | Array;
  errors: Null | ErrorsField;
  code: Integer;
}
