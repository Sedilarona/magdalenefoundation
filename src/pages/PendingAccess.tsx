import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/** Shown to signed-in people who are not yet part of an active family circle. */
const PendingAccess = () => {
  const { user, family, signOut, acceptInvite, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const waitingApproval = family?.family_id && family?.status !== "approved";

  const redeem = async () => {
    if (!token.trim()) return;
    setBusy(true);
    const res = await acceptInvite(token.trim());
    setBusy(false);
    if (res.ok) {
      toast({ title: "Welcome home", description: "You have joined your family circle." });
      navigate("/dashboard", { replace: true });
    } else {
      toast({
        title: "That invitation did not work",
        description:
          res.error === "family_not_active"
            ? "This family circle is still waiting for approval."
            : "The invitation is invalid, already used, or expired. Ask your family admin for a new one.",
        variant: "destructive",
      });
    }
  };

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
              Your family circle is awaiting approval
            </h1>
            <p className="text-muted-foreground text-sm">
              {family?.family_name} has been requested and is being reviewed. You will be able to
              enter as soon as it is approved.
            </p>
          </>
        ) : (
          <>
            <MailCheck className="w-10 h-10 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              You need an invitation
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Signed in as {user?.email}. Families are private — paste the invitation code sent to
              you by a family admin to join your circle.
            </p>

            <div className="space-y-2">
              <Label htmlFor="token" className="text-foreground">Invitation code</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your invitation code"
                className="h-12"
                disabled={busy}
              />
            </div>
            <Button className="w-full mt-4" size="lg" onClick={redeem} disabled={busy}>
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join my family"}
            </Button>
          </>
        )}

        <div className="mt-8 flex items-center justify-between text-sm">
          <Link to="/request-family" className="text-primary hover:underline">
            Start a new family circle
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
