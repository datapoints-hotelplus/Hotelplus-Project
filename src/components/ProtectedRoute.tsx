import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import { supabase } from "../lib/supabase";

type Props = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { role, loading: roleLoading } = useUserRole();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthLoading(false);
    };

    getSession();
  }, []);

  if (authLoading || roleLoading) return <div>Loading...</div>;

  if (!session) return <Navigate to="/login" replace />;

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
