import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Mail, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  ADMIN_EMAIL,
  ADMIN_EMAIL_LINK,
  ADMIN_WHATSAPP_DISPLAY,
  ADMIN_WHATSAPP_LINK,
} from "@/lib/contacts";

/** Shown to signed-in people whose account is not yet linked to the family circle. */
const PendingAccess = () => {
  const { user, family, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const waitingApproval = family?.family_id && family?.status !== "approved";

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[20px] border border-border bg-card p-8 shadow-lg"
      >
        <Link to="/" className="inline-block mb-6">
          <Logo size="md" />
        </Link>

        {waitingApproval ? (
          <>
            <ShieldCheck className="w-10 h-10 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Your access is awaiting approval
            </h1>
            <p className="text-muted-foreground text-sm">
              {family?.family_name} is being reviewed. You will be able to enter as soon as it is
              approved.
            </p>
          </>
        ) : (
          <>
            <Users className="w-10 h-10 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              We could not match your name
            </h1>
            <p className="text-muted-foreground text-sm">
              Signed in as {user?.email}. To enter the archive your name must appear in the family
              tree. Sign up again and pick your name from the list, or reach the family
              administrator below and your name will be added.
            </p>
          </>
        )}

        <div className="mt-6 space-y-3">
          <a href={ADMIN_EMAIL_LINK} className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Mail className="w-4 h-4 text-primary" />
              <span className="truncate">{ADMIN_EMAIL}</span>
            </Button>
          </a>
          <a href={ADMIN_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="block">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>WhatsApp {ADMIN_WHATSAPP_DISPLAY}</span>
            </Button>
          </a>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm">
          <Link to="/register" className="text-primary hover:underline">
            Choose my name
          </Link>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingAccess;
