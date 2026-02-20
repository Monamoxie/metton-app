import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";
import CssBaseline from "@mui/material/CssBaseline";
import { LayoutProps } from "@/types/layout-props";
import AppProvider from "@/providers/AppProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Metton",
  description: "wip",
};

export default async function RootLayout(props: Readonly<LayoutProps>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang="en">
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider>{props.children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
