import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Search, Loader2, Crown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { setMemberApproved, rejectMember } from "@/lib/admin-members.functions";
import { Link } from "@/lib/router-compat";
import { useAdminScope } from "@/components/RequireSuperAdmin";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Applicant = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  referred_by_code: string | null;
  created_at: string;
};

export function MemberApprovals({ pendingCount }: { pendingCount?: number }) {
  const [rows, setRows] = useState<Applicant[]>([]);
  const [referrerNames, setReferrerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [rejecting, setRejecting] = useState<Applicant | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();
  const rejectFn = useServerFn(rejectMember);
  const approveFn = useServerFn(setMemberApproved);

  const load = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const byUser = new Map<string, string[]>();
    for (const r of (roles ?? []) as any[]) {
      const a = byUser.get(r.user_id) ?? [];
      a.push(r.role);
      byUser.set(r.user_id, a);
    }
    const prospectiveIds = Array.from(byUser.entries())
      .filter(([, list]) => list.length === 1 && list[0] === "prospective_member")
      .map(([id]) => id);

    if (prospectiveIds.length === 0) {
      setRows([]); setReferrerNames({}); setLoading(false); return;
    }
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, company, industry, referred_by_code, created_at")
      .in("id", prospectiveIds)
      .order("created_at", { ascending: false });

    const list = (profs ?? []) as Applicant[];
    setRows(list);

    const codes = Array.from(new Set(list.map((a) => a.referred_by_code).filter(Boolean))) as string[];
    if (codes.length > 0) {
      const { data: refs } = await supabase
        .from("profiles").select("referral_code, first_name, last_name")
        .in("referral_code", codes);
      const map: Record<string, string> = {};
      for (const r of (refs ?? []) as any[]) {
        map[r.referral_code] = [r.first_name, r.last_name].filter(Boolean).join(" ") || r.referral_code;
      }
      setReferrerNames(map);
    } else {
      setReferrerNames({});
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((m) => {
    const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim().toLowerCase();
    const q = search.toLowerCase();
    const okSearch = !q || name.includes(q) || (m.company ?? "").toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q);
    const okFilter = filter === "all"
      || (filter === "referred" && m.referred_by_code)
      || (filter === "direct" && !m.referred_by_code);
    return okSearch && okFilter;
  }), [rows, search, filter]);

  const approve = async (m: Applicant, asLion = false) => {
    setBusy(m.id);
    try {
      await approveFn({ data: { memberId: m.id, approved: true, sendWelcome: true } });
      if (asLion) {
        await supabase.from("user_roles").insert({ user_id: m.id, role: "impact_lion" });
      }
      toast({ title: "Member approved", description: `${m.first_name ?? "Member"} is now an active AJBN member${asLion ? " + Impact Lion" : ""}.` });
      load();
    } catch (e: any) {
      toast({ title: "Could not approve", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const reject = async (m: Applicant) => {
    setBusy(m.id);
    try {
      const result = await rejectFn({ data: { memberId: m.id, reason: rejectReason.trim() || undefined } });
      toast({ title: "Application declined", description: result.emailSent ? "Rejection email sent." : "Could not send rejection email.", variant: "destructive" });
      setRejecting(null);
      setRejectReason("");
      load();
    } catch (e: any) {
      toast({ title: "Could not decline", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
          {typeof pendingCount === "number" && pendingCount > 0 && (
            <Badge variant="default" className="rounded-full px-2">{pendingCount}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{rows.length} application{rows.length !== 1 && "s"} awaiting review</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email or company…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="referred">Referred Only</SelectItem>
            <SelectItem value="direct">Direct Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card rounded-xl border p-4 shadow-xs space-y-3">
            <div>
              <p className="font-semibold text-sm">{m.first_name} {m.last_name}</p>
              <p className="text-xs text-muted-foreground">{[m.company, m.industry].filter(Boolean).join(" · ")}</p>
              <p className="text-xs text-muted-foreground">{m.email}</p>
            </div>
            {m.referred_by_code && (
              <p className="text-xs text-muted-foreground">Referred by <span className="font-medium text-foreground">{referrerNames[m.referred_by_code] ?? m.referred_by_code}</span></p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link to={`/admin/members/${m.id}`}><Eye size={14} /> View</Link>
              </Button>
              <Button size="sm" className="flex-1" disabled={busy === m.id} onClick={() => approve(m)}><Check size={14} /> Approve</Button>
              <Button size="sm" variant="outline" disabled={busy === m.id} onClick={() => approve(m, true)}><Crown size={14} className="text-gold" /></Button>
              <Button size="sm" variant="destructive" disabled={busy === m.id} onClick={() => setRejecting(m)}><X size={14} /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No pending applications.</p>
        )}
      </div>

      <div className="hidden md:block bg-card rounded-xl border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </TableCell>
                <TableCell className="text-sm">{m.company ?? "—"}</TableCell>
                <TableCell className="text-sm">{m.industry ?? "—"}</TableCell>
                <TableCell className="text-sm">
                  {m.referred_by_code ? (
                    <Badge variant="secondary" className="text-xs">{referrerNames[m.referred_by_code] ?? m.referred_by_code}</Badge>
                  ) : <span className="text-muted-foreground text-xs">Direct</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/members/${m.id}`}><Eye size={14} /></Link>
                    </Button>
                    <Button size="sm" disabled={busy === m.id} onClick={() => approve(m)}><Check size={14} /> Approve</Button>
                    <Button size="sm" variant="outline" disabled={busy === m.id} onClick={() => approve(m, true)} title="Approve + Impact Lion">
                      <Crown size={14} className="text-gold" />
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busy === m.id} onClick={() => setRejecting(m)}><X size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No pending applications.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not approve {rejecting ? `${rejecting.first_name ?? ""} ${rejecting.last_name ?? ""}`.trim() || "this member" : "this member"}?</DialogTitle>
            <DialogDescription>The member will be emailed that their application was not approved at this time.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason (optional, included in email)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)} disabled={busy === rejecting?.id}>Cancel</Button>
            <Button variant="destructive" disabled={busy === rejecting?.id} onClick={() => rejecting && void reject(rejecting)}>
              Send rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
