import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        console.log("AUTH EVENT:", _event);

        setSession(session);

        // LOGIN
        if (
          (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") &&
          session?.user?.email
        ) {
          await supabase
            .from("login_activity")
            .insert({
              email: session.user.email,
              action: "login"
            });
        }

        // LOGOUT
        if (_event === "SIGNED_OUT" && session?.user?.email) {
          await supabase
            .from("login_activity")
            .insert({
              email: session.user.email,
              action: "logout"
            });
        }
      }
    );


    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
