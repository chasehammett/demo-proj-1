import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6">Loading…</div>;
  return token ? children : <Navigate to="/login" replace />;
}
