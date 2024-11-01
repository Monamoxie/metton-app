import { Box, Typography, Avatar, Stack, IconButton } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const MessageItem = ({ name, message, time, avatar }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      "&:hover": {
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
      },
    }}
  >
    <Avatar src={avatar} />
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography variant="caption" sx={{ color: "grey.500" }}>
          {time}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "grey.500" }}>
        {message}
      </Typography>
    </Box>
    <IconButton size="small" sx={{ color: "grey.500" }}>
      <StarBorderIcon />
    </IconButton>
  </Box>
);

const MessagesSection = () => {
  return (
    <Box
      sx={{ p: 3, bgcolor: "rgba(0,0,0,0.2)", borderRadius: 4, height: "100%" }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Client Messages
      </Typography>
      <Stack spacing={1}>
        {[
          {
            name: "David",
            message:
              "Hey tell me about progress of project? Waiting for your response",
            time: "21 July",
            avatar: "",
          },
          // Add more message objects here
        ].map((message, index) => (
          <MessageItem key={index} {...message} />
        ))}
      </Stack>
    </Box>
  );
};

export default MessagesSection;
