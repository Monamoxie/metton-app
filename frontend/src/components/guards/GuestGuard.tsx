"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as AuthService from "@/services/auth-service";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const authenticated = AuthService.isAuthenticated();
    authenticated ? router.replace("/dashboard") : setIsGuest(true);

    setAuthChecked(true); // we're done checking
  }, [router]);

  if (!authChecked) {
    // Optional loading UI while checking
    return <div>Loading... please wait</div>;
  }

  return isGuest ? <>{children}</> : null;
}
