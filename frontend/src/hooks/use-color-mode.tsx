import { useContext } from "react";
import { AppModeContext } from "@/providers/AppProvider";

export default function useColorMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within an App Mode context");
  }
  return context;
}
