"use client";

import * as React from "react";
import { Card as MUICard, CardProps as MUICardProps } from "@mui/material";

export interface CardProps extends MUICardProps {}

export function Card(props: CardProps) {
  const { sx, ...rest } = props;

  return (
    <MUICard
      variant="outlined"
      {...rest}
      sx={{
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-bg-card)",
        boxShadow: "var(--shadow-sm)",
        transition: "all 150ms ease",
        "&:hover": {
          boxShadow: "var(--shadow-md)",
          borderColor: "var(--neutral-600)",
        },
        ...sx,
      }}
    />
  );
}

export default Card;

