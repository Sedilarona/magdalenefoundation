import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  generation: string | null;
  location: string | null;
  occupation: string | null;
  bio: string | null;
  avatar_url: string | null;
  contribution_points: number;
  family_id: string | null;
}

export interface FamilyInfo {
  family_id: string | null;
  family_name: string | null;
  motto: string | null;
  status: string | null;
  is_admin: boolean;
  is_platform_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  family: FamilyInfo | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    inviteToken: string,
  ) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  acceptInvite: (token: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_INVITE_KEY = "magdalene.pending_invite";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // Always replace — never leave a previous user's profile in state.
    setProfile(!error && data ? (data as unknown as Profile) : null);

    const { data: fam } = await (supabase as any).rpc("my_family");
    const row = Array.isArray(fam) ? fam[0] : fam;
    setFamily(row ? (row as FamilyInfo) : null);
  }, []);

  // Redeem an invitation link that was stored before the email was confirmed.
  const redeemPendingInvite = useCallback(async () => {
    const token = localStorage.getItem(PENDING_INVITE_KEY);
    if (!token) return;
    const { data } = await (supabase as any).rpc("accept_family_invite", { _token: token });
    if (data?.ok) localStorage.removeItem(PENDING_INVITE_KEY);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          await redeemPendingInvite();
          await fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setFamily(null);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await redeemPendingInvite();
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, redeemPendingInvite]);

  const signUp = async (email: string, password: string, fullName: string, inviteToken: string) => {
    const redirectUrl = `${window.location.origin}/login`;

    // Remember the invitation so it can be redeemed after the email is confirmed.
    if (inviteToken) localStorage.setItem(PENDING_INVITE_KEY, inviteToken);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, invite_token: inviteToken },
      },
    });

    if (!error && data.user) {
      try {
        await supabase.functions.invoke("notify-new-profile", {
          body: { profileId: data.user.id, fullName, email },
        });
      } catch {
        // Notification failures must never block a sign-up.
      }
    }

    // With email confirmation on, no session is returned until the link is clicked.
    return { error, needsConfirmation: !error && !data.session };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    setProfile(null);
    setFamily(null);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // ignore — local state is already cleared
    }
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const acceptInvite = async (token: string) => {
    const { data, error } = await (supabase as any).rpc("accept_family_invite", { _token: token });
    if (error) return { ok: false, error: error.message };
    if (!data?.ok) return { ok: false, error: data?.error ?? "invalid_invite" };
    localStorage.removeItem(PENDING_INVITE_KEY);
    if (user) await fetchProfile(user.id);
    return { ok: true };
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, family, loading, signUp, signIn, signOut, refreshProfile, acceptInvite }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
