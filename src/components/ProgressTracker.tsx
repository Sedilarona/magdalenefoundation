import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { saveProgress } from "@/lib/progress";

const SKIP = ["/login", "/register", "/forgot-password", "/reset-password", "/pending", "/"];

/**
 * Quietly remembers the last place each signed-in member visited. Writes are
 * debounced and limited to one row per person, so many people can browse at
 * once without extra load.
 */
export function ProgressTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastSaved = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    const route = location.pathname;
    if (SKIP.includes(route)) return;
    if (lastSaved.current === route) return;

    const timer = window.setTimeout(() => {
      lastSaved.current = route;
      void saveProgress(route);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [user, location.pathname]);

  return null;
}

export default ProgressTracker;
