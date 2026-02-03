import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error) setRole(data.role);
    };

    fetchRole();
  }, []);

  return role;
}
