import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not send the link", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-block mb-8"><Logo size="md" /></Link>

        {sent ? (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <MailCheck className="w-12 h-12 text-primary mx-auto mb-4" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              If <strong className="text-foreground">{email}</strong> belongs to an account, a password
              reset link is on its way. Open it to choose a new password.
            </p>
            <Link to="/login" className="inline-block mt-6 text-primary hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8">
              Enter the email you signed up with and we will send you a confirmation link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" className="pl-11 h-12" required disabled={loading} />
                </div>
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending…</> : "Send reset link"}
              </Button>
            </form>
            <Link to="/login" className="inline-flex items-center gap-2 mt-8 text-muted-foreground hover:text-foreground text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
