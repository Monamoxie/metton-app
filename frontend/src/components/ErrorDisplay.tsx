import Alert from "@mui/material/Alert";

type ErrorProps = {
  errors: {
    [key: string]: string | string[];
  };
  message?: string;
};

export default function ErrorDisplay({ errors, message }: ErrorProps) {
  return (
    <div>
      {Object.keys(errors).map((key) => (
        <Alert severity="error" key={key}>
          <strong>{message}</strong>{" "}
          {Array.isArray(errors[key])
            ? errors[key].map((msg, index) => <div key={index}>{msg}</div>)
            : errors[key]}
        </Alert>
      ))}
    </div>
  );
}
