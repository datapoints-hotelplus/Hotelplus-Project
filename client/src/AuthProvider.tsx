import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type AuthState = {
    session: any;
    role: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthState>({
    session: null,
    role: null,
    loading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider mounted");

        const loadSessionAndRole = async (session: any) => {
            setSession(session);

            if (!session?.user) {
                setRole(null);
                setLoading(false);
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (!error) {
                setRole(profile?.role ?? null);
            } else {
                setRole(null);
            }

            setLoading(false);
        };

        // 1️⃣ โหลดครั้งแรก
        supabase.auth.getSession().then(({ data }) => {
            loadSessionAndRole(data.session);
        });

        // 2️⃣ ฟัง login / logout / switch user
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                console.log("AUTH EVENT:", _event);
                loadSessionAndRole(session);
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);



    return (
        <AuthContext.Provider value={{ session, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
