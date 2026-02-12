import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../AuthProvider";
import Loading from "../components/Loading/Loading";


type Props = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { session, role, loading } = useAuth();

  if (loading) return <Loading show text="กำลังตรวจสอบสิทธิ์ผู้ใช้งาน..." />;

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
