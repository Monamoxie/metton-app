"use client";

import Button from "@mui/material/Button";
import { LayoutProps } from "@/interfaces/layout-props";
import Stack from "@mui/material/Stack";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import * as React from "react";
import useColorMode  from "@/hooks/useColorMode";

export default function IdentityLayout(props: LayoutProps) {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <div className="identity">
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          position: { sm: "static", md: "fixed" },
          width: "100%",
          p: { xs: 2, sm: 4 },
        }}
      >
        {
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            component="a"
            href="/material-ui/getting-started/templates/"
          >
            Home
          </Button>
        }
        <ToggleColorMode
          data-screenshot="toggle-mode"
          mode={mode}
          toggleColorMode={toggleColorMode}
        />
      </Stack>
      {props.children}
    </div>
  );
}
