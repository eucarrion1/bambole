import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "manager" | "customer";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: Role[];
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, roles: [], isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const roleRequestRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function applySession(nextSession: Session | null) {
      const requestId = ++roleRequestRef.current;
      setLoading(true);
      setSession(nextSession);

      if (!nextSession?.user) {
        if (mounted && requestId === roleRequestRef.current) {
          setRoles([]);
          setLoading(false);
        }
        return;
      }

      const nextRoles = await loadRoles(nextSession.user.id);
      if (mounted && requestId === roleRequestRef.current) {
        setRoles(nextRoles);
        setLoading(false);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => {
        void applySession(s);
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      await applySession(data.session);
    }).catch(() => {
      if (mounted) {
        setSession(null);
        setRoles([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) return [];
    return (data?.map((r) => r.role as Role)) ?? [];
  }

  const value: AuthCtx = {
    user: session?.user ?? null,
    session,
    loading,
    roles,
    isAdmin: roles.includes("admin") || roles.includes("manager"),
    signOut: async () => { await supabase.auth.signOut(); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
