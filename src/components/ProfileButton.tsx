import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const initialsOf = (name?: string | null) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/**
 * Fixed profile access button, top-right of the app.
 * Tapping it opens the signed-in member's own profile.
 */
export const ProfileButton = ({ className = "" }: { className?: string }) => {
  const { user, profile } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = profile?.avatar_url;
    if (!path) {
      setAvatar(null);
      return;
    }
    supabase.storage
      .from("family-media")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (!cancelled) setAvatar(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_url]);

  if (!user) return null;

  const initials = initialsOf(profile?.full_name) || initialsOf(user.email);

  return (
    <Link
      to="/profile"
      aria-label="Open my profile"
      title={profile?.full_name || user.email || "My profile"}
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/50 bg-card/90 text-sm font-semibold text-foreground shadow-[var(--shadow-archive)] backdrop-blur transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
    >
      {avatar ? (
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="h-5 w-5" aria-hidden="true" />
      )}
    </Link>
  );
};

export default ProfileButton;
