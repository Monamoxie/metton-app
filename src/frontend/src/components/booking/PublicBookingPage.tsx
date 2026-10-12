"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import ErrorDisplay from "@/components/ErrorDisplay";
import * as BookingService from "@/services/booking-service";
import { AvailableSlot } from "@/types/schedule";
import { CreateBookingInput, PublicHostProfile } from "@/types/booking";
import HostPanel from "./HostPanel";
import SchedulingPanel from "./SchedulingPanel";
import ConfirmBookingForm from "./ConfirmBookingForm";
import BookingSuccess from "./BookingSuccess";

interface PublicBookingPageProps {
  publicId: string;
}

const PublicBookingPage: React.FC<PublicBookingPageProps> = ({ publicId }) => {
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<PublicHostProfile | null>(null);
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string[] } | null>(null);

  const [duration, setDuration] = useState(30);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [bookingErrors, setBookingErrors] = useState<{ [key: string]: string[] } | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await BookingService.getPublicProfile(publicId);
      if (response.code === 200) {
        setProfile(response.data?.profile ?? null);
      } else {
        setProfileErrors(response.errors || { error: [response.message || "Not found"] });
      }
      setFetchingProfile(false);
    };
    fetchProfile();
  }, [publicId]);

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setBookingErrors(null);
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    setSelectedSlot(null);
  };

  const handleSubmit = async (input: CreateBookingInput) => {
    setSubmitting(true);
    setBookingErrors(null);

    const response = await BookingService.createBooking(publicId, input);

    setSubmitting(false);
    if (response.code === 201) {
      setBooked(true);
    } else {
      setBookingErrors(response.errors || { non_field_errors: [response.message || "Something went wrong"] });
    }
  };

  const handleBookAnother = () => {
    setBooked(false);
    setSelectedSlot(null);
    setBookingErrors(null);
  };

  if (fetchingProfile) {
    return <CircularProgressBox />;
  }

  if (profileErrors) {
    return <ErrorDisplay errors={profileErrors} message="We couldn't find this booking page" />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          py: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Metton</Typography>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: 920,
          my: { xs: 3, md: 5 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
          boxShadow: 4,
        }}
      >
        <HostPanel profile={profile} duration={duration} onDurationChange={handleDurationChange} />

        {booked && selectedSlot ? (
          <BookingSuccess
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            hostName={profile?.name || "your host"}
            onBookAnother={handleBookAnother}
          />
        ) : (
          <Box>
            <SchedulingPanel
              publicId={publicId}
              duration={duration}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
            {selectedSlot && (
              <Box sx={{ px: { xs: 3, md: 4.5 }, pb: { xs: 3, md: 4.5 } }}>
                <ConfirmBookingForm
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  duration={duration}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  errors={bookingErrors}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Typography variant="caption" sx={{ color: "text.secondary", pb: 2, mt: "auto" }}>
        Powered by Metton
      </Typography>
    </Box>
    </LocalizationProvider>
  );
};

export default PublicBookingPage;
