import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";
import CssBaseline from "@mui/material/CssBaseline";
import { LayoutProps } from "@/types/layout-props";
import ColorModeProviderContext from "@/contexts/ColorModeProviderContext";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

export const metadata: Metadata = {
  title: "Metton",
  description: "wip",
};

export default function RootLayout(props: Readonly<LayoutProps>) {
  return (
    <html lang="en">
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <body>
        <>
          <ColorModeProviderContext>{props.children}</ColorModeProviderContext>
        </>
      </body>
    </html>
  );
}
