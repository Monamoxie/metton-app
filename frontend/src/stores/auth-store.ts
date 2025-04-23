import { UserProfile, UserToken } from "@/types/identity";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: UserToken | null;
  user: UserProfile | null;
  rememberMe: boolean;
  setAuth: (token: UserToken, user: UserProfile, rememberMe: boolean) => void;
  clearAuth: () => void;
}

// -- // --
const storage = {
  name: "metton__auth-user",
  getStorage: () => {
    const raw = localStorage.getItem("metton__auth-user");

    try {
      const parsed = JSON.parse(raw || "{}");
      return parsed?.state?.rememberMe ? localStorage : sessionStorage;
    } catch {
      return sessionStorage;
    }
  },
};

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      rememberMe: false,
      setAuth: (token, user, rememberMe) => {
        // update zustand
        set({ token, user, rememberMe });

        // Secure server-side cookie (middleware uses this)
        fetch("/api/auth/set", {
          method: "POST",
          body: JSON.stringify({ token: token.token, expiry: token.expiry }),
          headers: { "Content-Type": "application/json" },
        });
      },
      clearAuth: async () => {
        set({ user: null, rememberMe: false });

        fetch("/api/auth/clear", {
          method: "POST",
        });

        try {
          await fetch("/api/auth/clear", {
            method: "POST",
          });
        } catch (err) {
          console.error("Failed to clear cookie:", err);
        }
      },
    }),
    storage
  )
);
