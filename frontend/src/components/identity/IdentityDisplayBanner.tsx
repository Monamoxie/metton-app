import { IDENTITY_OVERLAY_CSS } from "@/styles/modules/identity.css";
import { Box, Card, Stack } from "@mui/material";
import Image from "next/image";

type BannerProps = {
  message: string;
};

export default function IdentityDisplayBanner({ message }: BannerProps) {
  return (
    <Stack direction="column" sx={IDENTITY_OVERLAY_CSS}>
      <Box>
        <h1>{message}</h1>
      </Box>
    </Stack>
  );
}
