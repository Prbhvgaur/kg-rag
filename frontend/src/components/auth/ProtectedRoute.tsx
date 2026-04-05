import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../auth/AuthProvider";
import { Skeleton } from "../ui/skeleton";

export function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[60vh] w-full rounded-3xl" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        Supabase auth is not configured. Add <code>VITE_SUPABASE_URL</code> and{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> to the frontend environment before using the workspace.
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
