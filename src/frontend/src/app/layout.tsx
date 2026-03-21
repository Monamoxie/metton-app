import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "../styles/tokens.css";
import "../styles/typography.css";
import "./globals.css";
import { LayoutProps } from "@/types/layout-props";
import AppProvider from "@/providers/AppProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const display = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Metton",
  description: "wip",
};

export default async function RootLayout(props: Readonly<LayoutProps>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${mono.variable}`}
    >
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider>{props.children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
