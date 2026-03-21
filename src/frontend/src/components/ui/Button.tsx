"use client";

import * as React from "react";
import { Button as MUIButton, ButtonProps as MUIButtonProps } from "@mui/material";

type Variant = "primary" | "ghost" | "danger";
type Size = "md" | "lg";

export interface ButtonProps extends Omit<MUIButtonProps, "variant" | "color"> {
  variant?: Variant;
  size?: Size;
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  md: {
    paddingInline: 24,
    paddingBlock: 10,
    fontSize: 15,
  },
  lg: {
    paddingInline: 28,
    paddingBlock: 14,
    fontSize: 15,
  },
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    disabled,
    sx,
    ...rest
  } = props;

  const base: React.CSSProperties = {
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    textTransform: "none",
    transition: "all 150ms ease",
    boxShadow: "none",
  };

  let styles: React.CSSProperties = {};

  if (variant === "primary") {
    styles = {
      ...base,
      backgroundColor: "var(--brand-500)",
      color: "var(--neutral-950)",
      boxShadow: "var(--shadow-sm)",
    };
  } else if (variant === "ghost") {
    styles = {
      ...base,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "var(--color-border)",
      color: "var(--color-text-secondary)",
    };
  } else if (variant === "danger") {
    styles = {
      ...base,
      backgroundColor: "var(--color-danger)",
      color: "var(--neutral-50)",
    };
  }

  const hover: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: "var(--brand-400)",
          transform: "translateY(-1px)",
          boxShadow: "var(--shadow-md)",
        }
      : variant === "ghost"
      ? {
          borderColor: "var(--color-text-primary)",
          color: "var(--color-text-primary)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }
      : {
          backgroundColor: "hsl(4, 75%, 48%)",
        };

  const active: React.CSSProperties =
    variant === "primary"
      ? {
          backgroundColor: "var(--brand-600)",
          transform: "translateY(0)",
          boxShadow: "var(--shadow-sm)",
        }
      : {};

  const disabledStyles: React.CSSProperties = disabled
    ? {
        opacity: 0.4,
        cursor: "not-allowed",
        boxShadow: "none",
      }
    : {};

  return (
    <MUIButton
      disableElevation
      disableRipple
      {...rest}
      disabled={disabled}
      sx={{
        ...sizeStyles[size],
        ...styles,
        ...disabledStyles,
        "&:hover": disabled ? {} : hover,
        "&:active": disabled ? {} : active,
        "&:focus-visible": {
          outline: "none",
          boxShadow: "var(--shadow-brand)",
        },
        ...sx,
      }}
    />
  );
}

export default Button;

