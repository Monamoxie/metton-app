import Link from "next/link";
import Image from "next/image";
import { Box, Container, Stack, Typography } from "@mui/material";
import Button from "@/components/ui/Button";
import LinkButton from "@/components/ui/LinkButton";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--color-bg-page)",
        color: "var(--color-text-primary)",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
          bgcolor: "rgba(23,21,18,0.85)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Image
              src="/images/logo-transparent.png"
              alt="Metton"
              width={120}
              height={40}
            />
          </Box>

          <Box
            component="nav"
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 3,
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <Link href="#features">Features</Link>
            <Link href="#open-source">Open Source</Link>
            <Link href="#pricing">Pricing</Link>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <LinkButton variant="ghost" size="md" href="/identity/signin">
              Sign in
            </LinkButton>
            <LinkButton variant="primary" size="md" href="/identity/signup">
              Get started free
            </LinkButton>
          </Box>
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          bgcolor: "var(--color-bg-page)",
          color: "var(--color-text-primary)",
        }}
      >
        {/* Hero */}
        <Box sx={{ py: "var(--space-8)" }}>
          <Container
            maxWidth="lg"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
              gap: { xs: 6, md: 8 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                className="text-display-xl"
                sx={{ mb: 3, maxWidth: 600 }}
              >
                Scheduling that feels like yours.
              </Typography>
              <Typography
                className="text-body-lg"
                sx={{
                  color: "var(--color-text-secondary)",
                  maxWidth: 480,
                  mb: 4,
                }}
              >
                Metton helps solopreneurs and small teams manage bookings
                without vendor lock-in. Open source, self-hostable, and
                designed for humans, not contracts.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <LinkButton variant="primary" size="lg" href="/identity/signup">
                  Get started free
                </LinkButton>
                <LinkButton variant="ghost" size="lg" href="https://github.com">
                  View on GitHub
                </LinkButton>
              </Stack>

              <Typography
                className="text-body-sm"
                sx={{ color: "var(--color-text-secondary)", mt: 2 }}
              >
                No credit card required. MIT-licensed.
              </Typography>
            </Box>

            {/* Booking preview card */}
            <Box
              sx={{
                position: "relative",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-glow)",
                p: 1,
                bgcolor: "radial-gradient(circle at 0 0, rgba(232,187,42,0.16), transparent 55%)",
              }}
            >
              <Card
                sx={{
                  borderRadius: "var(--radius-xl)",
                  bgcolor: "var(--color-bg-card)",
                }}
              >
                <Box
                  sx={{
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 1.5,
                    mb: 2,
                  }}
                >
                  <Typography className="text-mono" sx={{ fontSize: 12 }}>
                    mettoncloud.com/meet/alex-morgan
                  </Typography>
                </Box>

                <Stack direction="row" spacing={3} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "var(--radius-full)",
                      bgcolor: "var(--neutral-700)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    AM
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography className="text-heading-md">
                      Alex Morgan
                    </Typography>
                    <Typography
                      className="text-body-sm"
                      sx={{ color: "var(--color-text-secondary)", mb: 2 }}
                    >
                      Product Strategy Consultant
                    </Typography>

                    <Typography
                      className="text-label"
                      sx={{ mb: 1, color: "var(--color-text-secondary)" }}
                    >
                      Select a time
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ mb: 3, flexWrap: "wrap" }}
                    >
                      {["9:00 AM", "10:00 AM", "11:00 AM"].map((time) => (
                        <Box
                          key={time}
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                            bgcolor: "var(--neutral-800)",
                            fontSize: 13,
                          }}
                        >
                          {time}
                        </Box>
                      ))}
                    </Stack>

                    <Button variant="primary" size="md" fullWidth>
                      Confirm booking
                    </Button>
                  </Box>
                </Stack>
              </Card>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

