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

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      rememberMe: false,
      setAuth: (token, user, rememberMe) => {
        set({ token, user, rememberMe });
      },
      clearAuth: () => set({ user: null, rememberMe: false }),
    }),
    storage
  )
);

export default useAuthStore;
