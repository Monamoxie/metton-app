"use client";

import { useParams } from "next/navigation";
import PublicBookingPage from "@/components/booking/PublicBookingPage";

export default function MeetPage() {
  const params = useParams<{ publicId: string }>();

  return <PublicBookingPage publicId={params.publicId} />;
}
