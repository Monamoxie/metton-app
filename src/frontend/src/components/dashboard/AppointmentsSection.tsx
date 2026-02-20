import { Box, Card, Typography, Avatar, Chip, Divider } from "@mui/material";

interface AppointmentItemProps {
  title: string;
  time: string;
  date: string;
  status: "Confirmed" | "Pending";
  avatar: string;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({
  title,
  time,
  date,
  status,
  avatar,
}) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
      <Avatar src={avatar} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" color="textSecondary">
          {time} - {date}
        </Typography>
      </Box>
      <Chip
        label={status}
        size="small"
        color={status === "Confirmed" ? "success" : "warning"}
      />
    </Box>
    <Divider />
  </Box>
);

const AppointmentsSection: React.FC = () => {
  const appointments: AppointmentItemProps[] = [
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    {
      title: "Project Review Meeting",
      time: "10:00 AM",
      date: "Today",
      status: "Confirmed",
      avatar: "/path-to-avatar.jpg",
    },
    // Add more appointments...
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upcoming Appointments
      </Typography>
      {appointments.map((appointment, index) => (
        <AppointmentItem key={index} {...appointment} />
      ))}
    </Card>
  );
};

export default AppointmentsSection;
