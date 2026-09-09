import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Copy, Loader2, Plus, ShieldCheck, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Invite {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  status: string;
  token: string;
  expires_at: string;
}

interface FamilyName {
  id: string;
  full_name: string;
}

const FamilyAdmin = () => {
  const { family } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [names, setNames] = useState<FamilyName[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newInvite, setNewInvite] = useState({ fullName: "", email: "", role: "member" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data: inv } = await (supabase as any)
      .from("family_invites").select("*").order("created_at", { ascending: false });
    setInvites((inv ?? []) as Invite[]);

    // Names come from the family tree. Birth years stay private — only the name is shown.
    const { data: fam } = await (supabase as any).rpc("list_family_names");
    setNames(((fam ?? []) as { id: string; full_name: string }[]).map((n) => ({ id: n.id, full_name: n.full_name })));

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const inviteLink = (token: string) => `${window.location.origin}/register?invite=${token}`;

  const copy = async (token: string) => {
    await navigator.clipboard.writeText(inviteLink(token));
    toast({ title: "Invitation link copied", description: "Send it to your family member." });
  };

  const createInvite = async () => {
    if (!newInvite.fullName.trim() || !family?.family_id) return;
    setBusy(true);
    const { error } = await (supabase as any).from("family_invites").insert({
      family_id: family.family_id,
      full_name: newInvite.fullName.trim(),
      email: newInvite.email.trim() || null,
      role: newInvite.role,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not create invitation", description: error.message, variant: "destructive" });
      return;
    }
    setNewInvite({ fullName: "", email: "", role: "member" });
    toast({ title: "Invitation created", description: "Copy the link and share it." });
    load();
  };

  const revoke = async (id: string) => {
    await (supabase as any).from("family_invites").update({ status: "revoked" }).eq("id", id);
    load();
  };

  if (!family?.is_admin && !family?.is_platform_admin) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-6 text-center">
        <div>
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Admins only</h1>
          <p className="text-muted-foreground text-sm">Only family admins can invite members.</p>
          <Link to="/dashboard" className="inline-block mt-6 text-primary hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background p-5 pb-28 max-w-3xl mx-auto">
      <header className="py-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Family administration</h1>
          <p className="text-muted-foreground text-sm">{family?.family_name}</p>
        </div>
        <Link to="/activity">
          <Button variant="outline" size="sm" className="gap-2">
            <Activity className="w-4 h-4" /> Activity
          </Button>
        </Link>
      </header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 rounded-[18px] mb-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Invite a family member
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Select
                value={newInvite.fullName}
                onValueChange={(v) => setNewInvite((p) => ({ ...p, fullName: v }))}
                disabled={busy || loading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a family member" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {names.map((n) => (
                    <SelectItem key={n.id} value={n.full_name}>{n.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteEmail" className="text-foreground">Email (optional)</Label>
              <Input id="inviteEmail" type="email" className="h-11" value={newInvite.email} disabled={busy}
                onChange={(e) => setNewInvite((p) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={createInvite} disabled={busy || !newInvite.fullName.trim()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create invitation"}
            </Button>
            <Button variant="outline" disabled={busy}
              onClick={() => setNewInvite((p) => ({ ...p, role: p.role === "admin" ? "member" : "admin" }))}>
              Role: {newInvite.role}
            </Button>
          </div>
        </Card>
      </motion.div>

      <Card className="p-5 rounded-[18px]">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Invitations
        </h2>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invitations yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((i, idx) => (
              <motion.li key={i.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.35) }}
                className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground font-medium truncate">{i.full_name}</p>
                  <p className="text-muted-foreground text-xs truncate">{i.email ?? "no email"} · {i.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={i.status === "pending" ? "secondary" : "outline"}>{i.status}</Badge>
                  {i.status === "pending" && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => copy(i.token)} aria-label="Copy invitation link">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => revoke(i.id)} aria-label="Revoke invitation">
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default FamilyAdmin;
