import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Crown, MoreHorizontal, Loader2, Check, X, Clock, UserCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { decideProfileChange } from "@/lib/member-profile-approvals.functions";

type Role = "super_admin" | "ajbn_member" | "impact_lion" | "prospective_member";
type PendingField = "logo" | "company_name" | "website";
type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  created_at: string;
  roles: Role[];
  website: string | null;
  logo_url: string | null;
  pending_company_name: string | null;
  pending_website: string | null;
  pending_logo_url: string | null;
  company_name_status: string;
  website_status: string;
  logo_status: string;
};

const statusColors: Record<string, string> = {
  active: "bg-teal/10 text-teal border-teal/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
};

const pendingFieldsOf = (m: Member): PendingField[] => {
  const out: PendingField[] = [];
  if (m.logo_status === "pending") out.push("logo");
  if (m.company_name_status === "pending") out.push("company_name");
  if (m.website_status === "pending") out.push("website");
  return out;
};

const fieldLabels: Record<PendingField, string> = {
  logo: "Logo",
  company_name: "Company name",
  website: "Website",
};


export function MemberManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lionsFilter, setLionsFilter] = useState("all");
  const [changesFilter, setChangesFilter] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const decide = useServerFn(decideProfileChange);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, first_name, last_name, email, company, industry, created_at, website, logo_url, pending_company_name, pending_website, pending_logo_url, company_name_status, website_status, logo_status").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, Role[]>();
    for (const r of (roles ?? []) as { user_id: string; role: Role }[]) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    const list = ((profs ?? []) as any[]).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] })) as Member[];
    setMembers(list);
    setLoading(false);

    // Short-lived signed URLs so pending/live logos can be compared side by side.
    const paths = list.flatMap((m) => [m.logo_url, m.pending_logo_url].filter(Boolean) as string[]);
    if (paths.length) {
      const { data: signed } = await supabase.storage.from("member-logos").createSignedUrls(paths, 600);
      const map: Record<string, string> = {};
      for (const s of signed ?? []) if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
      setLogoUrls(map);
    }
  };

  useEffect(() => { load(); }, []);

  const statusOf = (m: Member) =>
    m.roles.includes("super_admin") ? "admin" :
    (m.roles.includes("ajbn_member") || m.roles.includes("impact_lion")) ? "active" :
    "pending";

  const pendingCount = useMemo(
    () => members.filter((m) => pendingFieldsOf(m).length > 0).length,
    [members],
  );

  const filtered = useMemo(() => members.filter((m) => {
    const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim();
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      name.toLowerCase().includes(q) ||
      (m.company ?? "").toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q);
    const st = statusOf(m);
    const matchesStatus = statusFilter === "all" || st === statusFilter;
    const isLion = m.roles.includes("impact_lion");
    const matchesLions = lionsFilter === "all" ||
      (lionsFilter === "lions" && isLion) ||
      (lionsFilter === "standard" && !isLion);
    const matchesChanges = changesFilter === "all" || pendingFieldsOf(m).length > 0;
    return matchesSearch && matchesStatus && matchesLions && matchesChanges;
  }), [members, search, statusFilter, lionsFilter, changesFilter]);

  const handleDecision = async (m: Member, field: PendingField, decision: "approve" | "reject") => {
    setDeciding(`${m.id}-${field}`);
    try {
      await decide({ data: { memberId: m.id, field, decision } });
      toast({ title: decision === "approve" ? `${fieldLabels[field]} approved` : `${fieldLabels[field]} change rejected` });
      await load();
    } catch (e) {
      toast({ title: "Could not update", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setDeciding(null);
    }
  };


  const handleExportCSV = () => {
    const rows = [
      ["First name","Last name","Email","Company","Industry","Status","Roles","Joined"],
      ...filtered.map((m) => [
        m.first_name ?? "", m.last_name ?? "", m.email ?? "",
        m.company ?? "", m.industry ?? "", statusOf(m), m.roles.join("|"),
        new Date(m.created_at).toISOString().slice(0,10),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ajbn-members-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} members exported.` });
  };

  const toggleLion = async (m: Member) => {
    if (m.roles.includes("impact_lion")) {
      await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "impact_lion");
      await logAudit("remove_lion", m);
      toast({ title: "Removed from Impact Lions" });
    } else {
      await supabase.from("user_roles").insert({ user_id: m.id, role: "impact_lion" });
      await logAudit("add_lion", m);
      toast({ title: "Added to Impact Lions" });
    }
    load();
  };

  // One click: prospective → approved AJBN member (role swap + audit trail).
  const promote = async (m: Member) => {
    setPromoting(m.id);
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: m.id, role: "ajbn_member" });
      if (error && !/duplicate key/i.test(error.message)) throw error;
      await supabase.from("user_roles").delete().eq("user_id", m.id).eq("role", "prospective_member");
      await logAudit("promote_to_ajbn_member", m);
      toast({ title: "Member approved", description: `${m.first_name ?? "Member"} is now an AJBN member.` });
      await load();
    } catch (e) {
      toast({ title: "Could not promote", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setPromoting(null);
    }
  };

  const suspend = async (m: Member) => {
    await supabase.from("user_roles").delete().eq("user_id", m.id).in("role", ["ajbn_member", "impact_lion"]);
    await logAudit("suspend_member", m);
    toast({ title: "Access suspended", description: `${m.first_name ?? "Member"} moved to prospective.` });
    load();
  };

  const logAudit = async (action: string, m: Member) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id, action, target_type: "user", target_id: m.id,
      details: { email: m.email, name: `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() },
    });
  };

  if (loading) {
    return <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">{members.length} total member{members.length !== 1 && "s"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Prospective</SelectItem>
            <SelectItem value="admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={lionsFilter} onValueChange={setLionsFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Membership" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="lions">Impact Lions</SelectItem>
            <SelectItem value="standard">Standard Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={changesFilter} onValueChange={setChangesFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Profile changes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All profile changes</SelectItem>
            <SelectItem value="pending">
              Pending logo/name changes{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.some((m) => pendingFieldsOf(m).length > 0) && (
        <div className="bg-card rounded-xl border shadow-xs p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gold" />
            <h2 className="font-semibold text-sm">Pending profile changes</h2>
            <Badge className="text-xs bg-gold/10 text-gold border-gold/20">{pendingCount}</Badge>
          </div>
          {filtered.filter((m) => pendingFieldsOf(m).length > 0).map((m) => (
            <div key={`pending-${m.id}`} className="border rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium">
                {m.first_name} {m.last_name}
                <span className="text-xs text-muted-foreground ml-2">{m.email}</span>
              </p>
              {pendingFieldsOf(m).map((field) => (
                <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">{fieldLabels[field]}</p>
                    {field === "logo" ? (
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 border rounded bg-muted overflow-hidden flex items-center justify-center">
                          {m.logo_url && logoUrls[m.logo_url]
                            ? <img src={logoUrls[m.logo_url]} alt="Current logo" className="h-full w-full object-contain" />
                            : <span className="text-[10px] text-muted-foreground">None</span>}
                        </div>
                        <span className="text-muted-foreground text-xs">→</span>
                        <div className="h-12 w-12 border border-gold/40 rounded bg-muted overflow-hidden flex items-center justify-center">
                          {m.pending_logo_url && logoUrls[m.pending_logo_url]
                            ? <img src={logoUrls[m.pending_logo_url]} alt="Proposed logo" className="h-full w-full object-contain" />
                            : <span className="text-[10px] text-muted-foreground">?</span>}
                        </div>
                      </div>
                    ) : (
                      <p>
                        <span className="text-muted-foreground line-through">
                          {(field === "company_name" ? m.company : m.website) ?? "—"}
                        </span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        <span className="font-medium">
                          {(field === "company_name" ? m.pending_company_name : m.pending_website) ?? "—"}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={deciding === `${m.id}-${field}`}
                      onClick={() => handleDecision(m, field, "approve")}>
                      <Check size={14} /> Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={deciding === `${m.id}-${field}`}
                      onClick={() => handleDecision(m, field, "reject")}>
                      <X size={14} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}


      <div className="md:hidden space-y-3">
        {filtered.map((m) => {
          const st = statusOf(m);
          const isLion = m.roles.includes("impact_lion");
          return (
            <div key={m.id} className="bg-card rounded-xl border p-4 shadow-xs space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{m.first_name} {m.last_name}</p>
                  {isLion && <Crown size={14} className="text-gold" />}
                </div>
                <Badge className={`text-xs ${statusColors[st]}`}>{st}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{[m.company, m.industry].filter(Boolean).join(" · ") || "—"}</p>
              <p className="text-xs text-muted-foreground">Joined {new Date(m.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
              {st === "pending" && (
                <Button size="sm" className="w-full" disabled={promoting === m.id} onClick={() => promote(m)}>
                  {promoting === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Promote to AJBN Member
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-xl border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const st = statusOf(m);
              const isLion = m.roles.includes("impact_lion");
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{m.company ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{m.industry ?? ""}</p>
                  </TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[st]}`}>{st}</Badge></TableCell>
                  <TableCell>
                    {isLion ? (
                      <Badge className="text-xs bg-gold/10 text-gold border-gold/20"><Crown size={12} className="mr-1" /> Impact Lion</Badge>
                    ) : <span className="text-sm text-muted-foreground">Standard</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      {st === "pending" && (
                        <Button size="sm" disabled={promoting === m.id} onClick={() => promote(m)}>
                          {promoting === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Promote to AJBN Member
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={14} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleLion(m)}>
                            {isLion ? "Remove from Impact Lions" : "Add to Impact Lions"}
                          </DropdownMenuItem>
                          {st === "active" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => suspend(m)}>
                              Suspend (revoke access)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No members match your filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}