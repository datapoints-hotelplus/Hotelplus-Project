import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setRole(data.role);
      }

      setLoading(false);
    };

    getRole();

    // 🔥 สำคัญมาก: ฟังตอน login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          setRole(null);
          return;
        }
        getRole();
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
}
