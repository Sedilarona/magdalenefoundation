import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Loader2, Plus, ShieldCheck, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface FamilyRequest {
  id: string;
  family_name: string;
  founder_name: string;
  contact_email: string;
  message: string | null;
  status: string;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "family";

const FamilyAdmin = () => {
  const { family } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newInvite, setNewInvite] = useState({ fullName: "", email: "", role: "member" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data: inv } = await (supabase as any)
      .from("family_invites").select("*").order("created_at", { ascending: false });
    setInvites((inv ?? []) as Invite[]);

    if (family?.is_platform_admin) {
      const { data: reqs } = await (supabase as any)
        .from("family_requests").select("*").order("created_at", { ascending: false });
      setRequests((reqs ?? []) as FamilyRequest[]);
    }
    setLoading(false);
  }, [family?.is_platform_admin]);

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

  const decide = async (req: FamilyRequest, approve: boolean) => {
    setBusy(true);
    if (!approve) {
      await (supabase as any).from("family_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", req.id);
      setBusy(false);
      load();
      return;
    }

    const { data: fam, error } = await (supabase as any).from("families")
      .insert({ name: req.family_name, slug: `${slugify(req.family_name)}-${Date.now().toString(36)}`, status: "approved" })
      .select().single();

    if (error) {
      setBusy(false);
      toast({ title: "Could not approve", description: error.message, variant: "destructive" });
      return;
    }

    const { data: created } = await (supabase as any).from("family_invites").insert({
      family_id: fam.id, full_name: req.founder_name, email: req.contact_email, role: "admin",
    }).select().single();

    await (supabase as any).from("family_requests")
      .update({ status: "approved", family_id: fam.id, reviewed_at: new Date().toISOString() }).eq("id", req.id);

    setBusy(false);
    load();

    if (created?.token) {
      await navigator.clipboard.writeText(inviteLink(created.token));
      toast({
        title: `${req.family_name} approved`,
        description: `Founder invitation link copied — send it to ${req.contact_email}.`,
      });
    }
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
      <header className="py-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Family administration</h1>
        <p className="text-muted-foreground text-sm">{family?.family_name}</p>
      </header>

      <Card className="p-5 rounded-[18px] mb-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Invite a family member
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-foreground">Full name</Label>
            <Input id="fullName" value={newInvite.fullName} disabled={busy}
              onChange={(e) => setNewInvite((p) => ({ ...p, fullName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteEmail" className="text-foreground">Email (optional)</Label>
            <Input id="inviteEmail" type="email" value={newInvite.email} disabled={busy}
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

      <Card className="p-5 rounded-[18px] mb-6">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Invitations
        </h2>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invitations yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invites.map((i) => (
              <li key={i.id} className="py-3 flex items-center justify-between gap-3">
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
              </li>
            ))}
          </ul>
        )}
      </Card>

      {family?.is_platform_admin && (
        <Card className="p-5 rounded-[18px]">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> New family circle requests
          </h2>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No requests waiting.</p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-foreground font-medium truncate">{r.family_name}</p>
                      <p className="text-muted-foreground text-xs truncate">{r.founder_name} · {r.contact_email}</p>
                    </div>
                    {r.status === "pending" ? (
                      <div className="flex gap-2 shrink-0">
                        <Button size="icon" variant="ghost" disabled={busy} onClick={() => decide(r, true)} aria-label="Approve">
                          <Check className="w-4 h-4 text-primary" />
                        </Button>
                        <Button size="icon" variant="ghost" disabled={busy} onClick={() => decide(r, false)} aria-label="Reject">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline">{r.status}</Badge>
                    )}
                  </div>
                  {r.message && <p className="text-muted-foreground text-xs mt-2">{r.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
};

export default FamilyAdmin;
