import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** Public form: anyone may ask to start their own family circle, subject to approval. */
const RequestFamily = () => {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ familyName: "", founderName: "", email: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.familyName.trim() || !form.founderName.trim() || !form.email.trim()) {
      toast({ title: "Missing details", description: "Family name, your name and email are required.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { error } = await (supabase as any).from("family_requests").insert({
      family_name: form.familyName.trim(),
      founder_name: form.founderName.trim(),
      contact_email: form.email.trim(),
      message: form.message.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not send your request", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-[20px] border border-border bg-card p-8 shadow-lg"
      >
        <Link to="/" className="inline-block mb-6"><Logo size="md" /></Link>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Request received</h1>
            <p className="text-muted-foreground text-sm">
              Your family circle will be reviewed. Once it is approved, an invitation link will be
              sent to {form.email} so you can set up your family and invite your relatives.
            </p>
            <Link to="/login" className="inline-block mt-6 text-primary hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Start a family circle
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Every family keeps its own private tree, stories and photos. Tell us about your family
              and we will review your request.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName" className="text-foreground">Family name</Label>
                <Input id="familyName" className="h-12" value={form.familyName} disabled={busy}
                  placeholder="e.g. Kgafela Family Circle"
                  onChange={(e) => setForm((p) => ({ ...p, familyName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderName" className="text-foreground">Your full name</Label>
                <Input id="founderName" className="h-12" value={form.founderName} disabled={busy}
                  onChange={(e) => setForm((p) => ({ ...p, founderName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Your email</Label>
                <Input id="email" type="email" className="h-12" value={form.email} disabled={busy}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Tell us about your family (optional)</Label>
                <Textarea id="message" rows={4} value={form.message} disabled={busy}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><Send className="w-4 h-4 mr-2" />Send request</>)}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RequestFamily;
