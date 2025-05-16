import { Box, Card, Typography } from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
}) => (
  <Card sx={{ p: 2 }}>
    {
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography color="textSecondary" variant="subtitle2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
          <Typography
            color={change >= 0 ? "success.main" : "error.main"}
            variant="body2"
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, opacity: 0.3 }} />
      </Box>
    }
  </Card>
);

interface BookingData {
  month: string;
  bookings: number;
}

const bookingData: BookingData[] = [
  { month: "Jan", bookings: 65 },
  { month: "Feb", bookings: 59 },
  { month: "Mar", bookings: 80 },
  { month: "Apr", bookings: 81 },
  { month: "May", bookings: 56 },
  { month: "Jun", bookings: 55 },
];

const ProjectsSection: React.FC = () => {
  return (
    <Box>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <StatsCard
            title="Total Bookings"
            value="1,234"
            change={12.5}
            icon={CalendarMonthIcon}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <StatsCard
            title="Available Slots"
            value="45"
            change={-5.2}
            icon={AccessTimeIcon}
          />
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Card sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Booking Trends
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Card sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Booking Trends
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default ProjectsSection;
