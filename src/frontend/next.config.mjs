import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Dev only: keep compiled pages in memory instead of dropping them after 60s idle
  // (the default), so pages warmed on start-up stay instant
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 100,
  },
};

export default withNextIntl(nextConfig);
