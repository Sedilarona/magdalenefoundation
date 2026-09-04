import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Blocks every app feature until the visitor has signed in AND belongs to an
 * approved family circle. Each family only ever sees its own records.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, family, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const active = family?.family_id && family?.status === "approved";
  if (!active) {
    return <Navigate to="/pending" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
