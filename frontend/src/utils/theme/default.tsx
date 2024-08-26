import { ThemeOptions, alpha } from "@mui/material/styles";
import { lightPalette, darkPalette } from "@/utils/theme/default/palette";
import { PaletteMode } from "@mui/material";
import { gray } from "@/utils/theme/default/color";

export default function defaultTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette: {
      mode,
      ...(mode === "light" ? lightPalette : darkPalette),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            transition: "all 100ms ease",
            backgroundColor: gray[50],
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${alpha(gray[200], 0.5)}`,
            boxShadow: "none",
            ...theme.applyStyles("dark", {
              backgroundColor: alpha(gray[800], 0.6),
              border: `1px solid ${alpha(gray[700], 0.3)}`,
            }),
            variants: [
              {
                props: {
                  variant: "outlined",
                },
                style: {
                  border: `1px solid ${gray[200]}`,
                  boxShadow: "none",
                  background: `linear-gradient(to bottom, hsl(0, 0%, 100%), ${gray[50]})`,
                  ...theme.applyStyles("dark", {
                    border: `1px solid ${alpha(gray[700], 0.4)}`,
                    boxShadow: "none",
                    background: `linear-gradient(to bottom, ${gray[900]}, ${alpha(
                      gray[800],
                      0.5
                    )})`,
                  }),
                },
              },
            ],
          }),
        },
      },
    },
  };
}
