"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as AuthService from "@/services/auth-service";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    const authenticated = AuthService.isAuthenticated();
    !authenticated ? router.replace("/identity/signin") : setHasAuth(true);
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    // return <div>Loading... please wait</div>; // optional loader
  }

  return hasAuth ? <>{children}</> : null;
}
