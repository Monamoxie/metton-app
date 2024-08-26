import { Identity_Display_Banner_Css } from "@/styles/modules/identity/identity-displayer-banner.css";
import { Box, Card, Stack } from "@mui/material";
import Image from "next/image";

export default function IdentityDisplayBanner() {
  return (
    <Stack direction="column" sx={Identity_Display_Banner_Css}>
      <Box>
        <h1>Do Great Things. Together.</h1>
        {/* <img src="/images/banner1.jpeg" /> */}
      </Box>
    </Stack>
  );
}
