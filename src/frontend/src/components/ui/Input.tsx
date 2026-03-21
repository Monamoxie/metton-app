"use client";

import * as React from "react";
import {
  TextField,
  TextFieldProps,
} from "@mui/material";

export interface InputProps extends TextFieldProps {}

export function Input(props: InputProps) {
  const { sx, ...rest } = props;

  return (
    <TextField
      {...rest}
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "var(--color-bg-card)",
          borderRadius: "var(--radius-sm)",
          "& fieldset": {
            borderWidth: 0.75,
            borderColor: "var(--color-border)",
          },
          "&:hover fieldset": {
            borderColor: "var(--neutral-400)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--color-accent)",
            boxShadow: "var(--shadow-brand)",
          },
          "&.Mui-error fieldset": {
            borderColor: "var(--color-danger)",
          },
          "& input": {
            paddingBlock: 8,
            paddingInline: 12,
          },
        },
        ...sx,
      }}
    />
  );
}

export default Input;

