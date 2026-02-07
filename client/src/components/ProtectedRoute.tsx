import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../AuthProvider";

type Props = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
