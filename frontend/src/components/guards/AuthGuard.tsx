"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as AuthService from "@/services/auth-service";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasAuth = AuthService.isAuthenticated();

  useEffect(() => {
    if (!hasAuth) router.replace("/identity/signin");
  }, [hasAuth]);

  if (!hasAuth) return null;

  return <>{children}</>;
}
