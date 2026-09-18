import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Search, Download, Crown, MoreHorizontal, Loader2, Check, X, Clock, UserCheck, KeyRound, Moon, Building2, Plus, Trash2, ShieldCheck, Pencil, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useSearchParams, Link } from "@/lib/router-compat";
import { useAdminScope } from "@/components/RequireSuperAdmin";
import { decideProfileChange } from "@/lib/member-profile-approvals.functions";
import { resetMemberPassword } from "@/lib/admin-password.functions";
import { setMemberQuietHours } from "@/lib/quiet-hours.functions";
import {
  createMemberAccount, setMemberApproved, setMemberRole, setMembershipTier,
  softDeleteMember, updateMemberFields, rejectMember,
} from "@/lib/admin-members.functions";
import { Textarea } from "@/components/ui/textarea";

type Role = "super_admin" | "ajbn_member" | "impact_lion" | "prospective_member";
type BaseRole = "prospective_member" | "ajbn_member" | "super_admin";
type Tier = "free" | "corporate" | "fully_paid";
type PendingField = "logo" | "company_name" | "website";
type EditableField = "first_name" | "last_name" | "company" | "industry" | "city";
type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  city: string | null;
  membership_tier: Tier;
  is_approved: boolean;
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
  quiet_hours_enabled: boolean;
};
type CompanyLink = { id: string; company_name: string; owner_user_id: string | null };

const statusColors: Record<string, string> = {
  active: "bg-teal/10 text-teal border-teal/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
};

const tierLabels: Record<Tier, string> = {
  free: "Free",
  corporate: "Corporate",
  fully_paid: "Fully Paid",
};

const roleLabels: Record<BaseRole, string> = {
  prospective_member: "Prospective",
  ajbn_member: "AJBN Member",
  super_admin: "Super Admin",
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

const baseRoleOf = (m: Member): BaseRole =>
  m.roles.includes("super_admin") ? "super_admin"
  : (m.roles.includes("ajbn_member") || m.roles.includes("impact_lion")) ? "ajbn_member"
  : "prospective_member";

const displayName = (m: Member) =>
  `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || m.email || "Unnamed member";

export function MemberManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scope = useAdminScope();
  const isFull = scope === "full";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("filter") === "pending" ? "pending" : "all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [lionsFilter, setLionsFilter] = useState("all");
  const [changesFilter, setChangesFilter] = useState("all");
  const [sortAZ, setSortAZ] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [companies, setCompanies] = useState<CompanyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [quieting, setQuieting] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ firstName: "", lastName: "", email: "", company: "", role: "prospective_member" as BaseRole });
  const [creating, setCreating] = useState(false);
  const [rejecting, setRejecting] = useState<Member | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const decide = useServerFn(decideProfileChange);
  const reject = useServerFn(rejectMember);
  const resetPassword = useServerFn(resetMemberPassword);
  const toggleQuiet = useServerFn(setMemberQuietHours);
  const saveFields = useServerFn(updateMemberFields);
  const changeRole = useServerFn(setMemberRole);
  const changeApproved = useServerFn(setMemberApproved);
  const changeTier = useServerFn(setMembershipTier);
  const removeMember = useServerFn(softDeleteMember);
  const addMember = useServerFn(createMemberAccount);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }, { data: companyRows }] = await Promise.all([
      supabase.from("profiles").select("id, first_name, last_name, email, company, industry, city, membership_tier, is_approved, created_at, website, logo_url, pending_company_name, pending_website, pending_logo_url, company_name_status, website_status, logo_status, quiet_hours_enabled, deleted_at").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("corporate_members").select("id, company_name, owner_user_id").order("company_name"),
    ]);
    const roleMap = new Map<string, Role[]>();
    for (const r of (roles ?? []) as { user_id: string; role: Role }[]) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    const list = ((profs ?? []) as any[]).map((p) => ({
      ...p,
      membership_tier: (p.membership_tier ?? "free") as Tier,
      is_approved: Boolean(p.is_approved),
      roles: roleMap.get(p.id) ?? [],
    })) as Member[];
    setMembers(list);
    setCompanies((companyRows ?? []) as CompanyLink[]);
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

  useEffect(() => {
    const current = searchParams.get("filter");
    if (statusFilter === "pending" && current !== "pending") {
      setSearchParams({ filter: "pending" }, { replace: true });
    } else if (statusFilter !== "pending" && current === "pending") {
      setSearchParams({}, { replace: true });
    }
  }, [statusFilter, searchParams, setSearchParams]);

  const companyMatch = (m: Member) => {
    if (!m.company) return false;
    const q = m.company.toLowerCase().trim();
    return companies.some((c) => c.company_name.toLowerCase().includes(q) || q.includes(c.company_name.toLowerCase()));
  };

  const handleReject = async (m: Member) => {
    try {
      const result = await reject({ data: { memberId: m.id, reason: rejectReason.trim() || undefined } });
      toast({ title: "Membership not approved", description: result.emailSent ? "Rejection email sent." : "Could not send rejection email." });
      setRejecting(null);
      setRejectReason("");
      await load();
    } catch (e: any) {
      toast({ title: "Could not reject", description: e?.message, variant: "destructive" });
    }
  };

  const statusOf = (m: Member) =>
    m.roles.includes("super_admin") ? "admin" :
    (m.roles.includes("ajbn_member") || m.roles.includes("impact_lion")) ? "active" :
    "pending";

  const pendingCount = useMemo(
    () => members.filter((m) => pendingFieldsOf(m).length > 0).length,
    [members],
  );

  const pendingMembers = useMemo(
    () => members.filter((m) => baseRoleOf(m) === "prospective_member" || !m.is_approved),
    [members],
  );

  const filtered = useMemo(() => {
    const rows = members.filter((m) => {
      const name = displayName(m);
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        name.toLowerCase().includes(q) ||
        (m.company ?? "").toLowerCase().includes(q) ||
        (m.email ?? "").toLowerCase().includes(q);
      const st = statusOf(m);
      const matchesStatus = statusFilter === "all" || st === statusFilter;
      const matchesRole = roleFilter === "all" || baseRoleOf(m) === roleFilter;
      const isLion = m.roles.includes("impact_lion");
      const matchesLions = lionsFilter === "all" ||
        (lionsFilter === "lions" && isLion) ||
        (lionsFilter === "standard" && !isLion);
      const matchesChanges = changesFilter === "all" || pendingFieldsOf(m).length > 0;
      return matchesSearch && matchesStatus && matchesRole && matchesLions && matchesChanges;
    });
    if (sortAZ) {
      rows.sort((a, b) => displayName(a).localeCompare(displayName(b), "en-GB", { sensitivity: "base" }));
    }
    return rows;
  }, [members, search, statusFilter, roleFilter, lionsFilter, changesFilter, sortAZ]);

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
      ["First name","Last name","Email","Company","Industry","City","Role","Approved","Membership","Joined"],
      ...filtered.map((m) => [
        m.first_name ?? "", m.last_name ?? "", m.email ?? "",
        m.company ?? "", m.industry ?? "", m.city ?? "",
        roleLabels[baseRoleOf(m)], m.is_approved ? "Yes" : "No", tierLabels[m.membership_tier],
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

  // One click: prospective → approved AJBN member + welcome email.
  const promote = async (m: Member) => {
    setPromoting(m.id);
    try {
      const result = await changeApproved({ data: { memberId: m.id, approved: true, sendWelcome: true } });
      toast({
        title: "Member approved",
        description: `${m.first_name ?? "Member"} is now an AJBN member${result.welcomeSent ? " and has been emailed a welcome." : "."}`,
      });
      await load();
    } catch (e) {
      toast({ title: "Could not approve", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setPromoting(null);
    }
  };

  const handleApprovedToggle = async (m: Member, approved: boolean) => {
    setBusy(m.id);
    try {
      const result = await changeApproved({ data: { memberId: m.id, approved, sendWelcome: approved } });
      toast({
        title: approved ? "Approved" : "Approval removed",
        description: approved
          ? `${displayName(m)} can now use the member area${result.welcomeSent ? " and has been emailed a welcome." : "."}`
          : `${displayName(m)} is back to prospective.`,
      });
      await load();
    } catch (e) {
      toast({ title: "Could not update", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleRoleChange = async (m: Member, role: BaseRole) => {
    setBusy(m.id);
    try {
      await changeRole({ data: { memberId: m.id, role } });
      toast({ title: "Role updated", description: `${displayName(m)} is now ${roleLabels[role]}.` });
      await load();
    } catch (e) {
      toast({ title: "Could not change role", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleTierChange = async (m: Member, tier: Tier) => {
    setBusy(m.id);
    try {
      await changeTier({ data: { memberId: m.id, tier } });
      toast({ title: "Membership updated", description: `${displayName(m)} is now ${tierLabels[tier]}.` });
      await load();
    } catch (e) {
      toast({ title: "Could not change membership", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const upgradeFullyPaid = async (m: Member) => {
    setBusy(m.id);
    try {
      await changeTier({ data: { memberId: m.id, tier: "fully_paid" } });
      if (baseRoleOf(m) === "prospective_member") {
        await changeApproved({ data: { memberId: m.id, approved: true, sendWelcome: true } });
      }
      toast({ title: "Upgraded", description: `${displayName(m)} is now a Fully Paid Corporate member.` });
      await load();
    } catch (e) {
      toast({ title: "Could not upgrade", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const makeSuperAdmin = async (m: Member) => {
    setBusy(m.id);
    try {
      await changeRole({ data: { memberId: m.id, role: "super_admin" } });
      toast({ title: "Super admin granted", description: `${displayName(m)} now has full admin access.` });
      await load();
    } catch (e) {
      toast({ title: "Could not grant admin", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const doDelete = async () => {
    const m = confirmDelete;
    if (!m) return;
    setBusy(m.id);
    try {
      await removeMember({ data: { memberId: m.id } });
      toast({ title: "Member removed", description: `${displayName(m)} is hidden from the portal. Nothing was erased.` });
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast({ title: "Could not remove", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const startEdit = (m: Member, field: EditableField) => {
    setEditing({ id: m.id, field });
    setEditValue((m[field] as string | null) ?? "");
  };

  const commitEdit = async () => {
    if (!editing) return;
    const { id, field } = editing;
    const target = members.find((m) => m.id === id);
    const next = editValue.trim();
    setEditing(null);
    if (!target || ((target[field] as string | null) ?? "") === next) return;
    try {
      await saveFields({ data: { memberId: id, fields: { [field]: next || null } } });
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: next || null } : m)));
      toast({ title: "Saved" });
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    }
  };

  const editableCell = (m: Member, field: EditableField, className?: string) => {
    const isEditing = editing?.id === m.id && editing.field === field;
    if (isEditing) {
      return (
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => void commitEdit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void commitEdit();
            if (e.key === "Escape") setEditing(null);
          }}
          className="h-8 text-sm"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => startEdit(m, field)}
        className={`group text-left text-sm hover:underline ${className ?? ""}`}
        title="Click to edit"
      >
        {(m[field] as string | null) || <span className="text-muted-foreground">—</span>}
        <Pencil size={11} className="ml-1 inline opacity-0 group-hover:opacity-60" />
      </button>
    );
  };

  const handleCreateMember = async () => {
    setCreating(true);
    try {
      await addMember({ data: {
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        email: newMember.email.trim(),
        company: newMember.company.trim(),
        role: newMember.role,
      } });
      toast({ title: "Member added", description: `${newMember.email} has been invited by email.` });
      setAddOpen(false);
      setNewMember({ firstName: "", lastName: "", email: "", company: "", role: "prospective_member" });
      await load();
    } catch (e) {
      toast({ title: "Could not add member", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const suspend = async (m: Member) => {
    await handleApprovedToggle(m, false);
  };

  const handlePasswordReset = async (m: Member) => {
    setResetting(m.id);
    try {
      await resetPassword({ data: { memberId: m.id } });
      toast({ title: "Password reset", description: `${m.email ?? "This member"} can now sign in with the temporary password.` });
    } catch (e) {
      toast({ title: "Could not reset password", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setResetting(null);
    }
  };

  const handleQuietHours = async (m: Member) => {
    setQuieting(m.id);
    const next = !m.quiet_hours_enabled;
    try {
      await toggleQuiet({ data: { memberId: m.id, enabled: next } });
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, quiet_hours_enabled: next } : x)));
      toast({ title: next ? "Quiet Hours on" : "Quiet Hours off", description: next ? "In-app alerts are muted Fri 6pm–Sat 10pm; messages are emailed instead." : "In-app alerts resume as normal." });
    } catch (e) {
      toast({ title: "Could not update Quiet Hours", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setQuieting(null);
    }
  };

  const handleCompanyLink = async (m: Member, companyId: string) => {
    setLinking(m.id);
    try {
      const current = companies.find((company) => company.owner_user_id === m.id);
      if (current && current.id !== companyId) {
        const { error } = await (supabase.rpc as any)("set_corporate_member_owner", { _company_id: current.id, _owner_user_id: null });
        if (error) throw error;
      }
      if (companyId !== "none") {
        const { error } = await (supabase.rpc as any)("set_corporate_member_owner", { _company_id: companyId, _owner_user_id: m.id });
        if (error) throw error;
      }
      toast({ title: companyId === "none" ? "Company unlinked" : "Company linked", description: `${m.first_name ?? "Member"}'s company listing has been updated.` });
      await load();
    } catch (e) {
      toast({ title: "Could not link company", description: e instanceof Error ? e.message : "Please try again.", variant: "destructive" });
    } finally {
      setLinking(null);
    }
  };

  const companyLinkControl = (m: Member, className?: string) => {
    const linked = companies.find((company) => company.owner_user_id === m.id);
    const available = companies.filter((company) => !company.owner_user_id || company.owner_user_id === m.id);
    return (
      <Select value={linked?.id ?? "none"} onValueChange={(value) => void handleCompanyLink(m, value)} disabled={linking === m.id}>
        <SelectTrigger className={className ?? "w-44 h-8"} aria-label={`Link company for ${m.first_name ?? "member"}`}>
          {linking === m.id ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
          <SelectValue placeholder="Link company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No linked company</SelectItem>
          {available.map((company) => <SelectItem key={company.id} value={company.id}>{company.company_name}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  };

  const roleControl = (m: Member, className?: string) => (
    <Select value={baseRoleOf(m)} onValueChange={(value) => void handleRoleChange(m, value as BaseRole)} disabled={busy === m.id}>
      <SelectTrigger className={className ?? "w-36 h-8"} aria-label={`Role for ${displayName(m)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="prospective_member">Prospective</SelectItem>
        <SelectItem value="ajbn_member">AJBN Member</SelectItem>
        <SelectItem value="super_admin">Super Admin</SelectItem>
      </SelectContent>
    </Select>
  );

  const tierControl = (m: Member, className?: string) => (
    <Select value={m.membership_tier} onValueChange={(value) => void handleTierChange(m, value as Tier)} disabled={busy === m.id}>
      <SelectTrigger className={className ?? "w-32 h-8"} aria-label={`Membership for ${displayName(m)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="corporate">Corporate</SelectItem>
        <SelectItem value="fully_paid">Fully Paid</SelectItem>
      </SelectContent>
    </Select>
  );

  const actionsMenu = (m: Member) => {
    const isLion = m.roles.includes("impact_lion");
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal size={14} /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => void upgradeFullyPaid(m)}>
            <Crown size={14} className="mr-2" /> Upgrade to Fully Paid Corporate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void makeSuperAdmin(m)}>
            <ShieldCheck size={14} className="mr-2" /> Make Super Admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleLion(m)}>
            {isLion ? "Remove from Impact Lions" : "Add to Impact Lions"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={quieting === m.id} onClick={() => handleQuietHours(m)}>
            <Moon size={14} className="mr-2" /> {m.quiet_hours_enabled ? "Turn off Quiet Hours" : "Turn on Quiet Hours"}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={resetting === m.id} onClick={() => handlePasswordReset(m)}>
            <KeyRound size={14} className="mr-2" /> Reset Password
          </DropdownMenuItem>
          {m.is_approved && (
            <DropdownMenuItem onClick={() => void suspend(m)}>
              Suspend (revoke access)
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(m)}>
            <Trash2 size={14} className="mr-2" /> Delete member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const logAudit = async (action: string, m: Member) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id, action, target_type: "user", target_id: m.id,
      details: { email: m.email, name: displayName(m) },
    });
  };

  if (loading) {
    return <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  if (!isFull) {
    const rows = pendingMembers.filter((m) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return displayName(m).toLowerCase().includes(q) || (m.company ?? "").toLowerCase().includes(q);
    });
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Pending approvals</h1>
          <p className="text-sm text-muted-foreground">{rows.length} member{rows.length === 1 ? "" : "s"} awaiting approval. Contact details are hidden in reviewer view.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name or company…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md" />
        </div>
        <div className="bg-card rounded-xl border shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Signed up</TableHead>
                <TableHead>Company match</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{displayName(m)}</TableCell>
                  <TableCell>{m.company || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(m.created_at).toLocaleDateString("en-GB")}</TableCell>
                  <TableCell>{companyMatch(m) ? <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">Yes</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/members/${m.id}`}><Eye size={14} className="mr-1" /> View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pending members.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Members Log</h1>
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {members.length} listings
            {pendingMembers.length > 0 && (
              <> — {pendingMembers.length} pending: {pendingMembers.slice(0, 6).map((m) => `${displayName(m)}${m.email ? ` (${m.email})` : ""}`).join(", ")}
              {pendingMembers.length > 6 ? ` +${pendingMembers.length - 6} more` : ""}</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Add New Member
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email or company…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="prospective_member">Prospective</SelectItem>
            <SelectItem value="ajbn_member">AJBN Member</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
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
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Profile changes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All profile changes</SelectItem>
            <SelectItem value="pending">
              Pending logo/name changes{pendingCount > 0 ? ` (${pendingCount})` : ""}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant={sortAZ ? "default" : "outline"} size="sm" onClick={() => setSortAZ((v) => !v)}>
          Sort A–Z
        </Button>
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
                  <p className="font-semibold text-sm">{displayName(m)}</p>
                  {isLion && <Crown size={14} className="text-gold" />}
                  {m.quiet_hours_enabled && (
                    <Badge className="text-xs bg-navy/10 text-navy border-navy/20"><Moon size={11} className="mr-1" /> Quiet Hours</Badge>
                  )}
                </div>
                <Badge className={`text-xs ${statusColors[st]}`}>{st}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{m.email}</p>
              <p className="text-xs text-muted-foreground">{[m.company, m.industry, m.city].filter(Boolean).join(" · ") || "—"}</p>
              {roleControl(m, "w-full h-9")}
              {tierControl(m, "w-full h-9")}
              <div className="flex items-center justify-between text-sm">
                <span>Approved</span>
                <Switch checked={m.is_approved} disabled={busy === m.id} onCheckedChange={(v) => void handleApprovedToggle(m, v)} />
              </div>
              {companyLinkControl(m, "w-full")}
              {!m.is_approved && (
                <Button size="sm" className="w-full" disabled={promoting === m.id} onClick={() => promote(m)}>
                  {promoting === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Approve as Member
                </Button>
              )}
              <div className="flex justify-end">{actionsMenu(m)}</div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-xl border shadow-xs overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const isLion = m.roles.includes("impact_lion");
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {editableCell(m, "first_name", "font-medium")}
                      {editableCell(m, "last_name", "font-medium")}
                      {isLion && <Crown size={12} className="text-gold" />}
                    </div>
                    {m.quiet_hours_enabled && (
                      <Badge className="text-xs bg-navy/10 text-navy border-navy/20 mt-1"><Moon size={11} className="mr-1" /> Quiet Hours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.email}</TableCell>
                  <TableCell>{editableCell(m, "company")}</TableCell>
                  <TableCell>{editableCell(m, "industry")}</TableCell>
                  <TableCell>{editableCell(m, "city")}</TableCell>
                  <TableCell>{roleControl(m)}</TableCell>
                  <TableCell>
                    <Switch checked={m.is_approved} disabled={busy === m.id} onCheckedChange={(v) => void handleApprovedToggle(m, v)} aria-label={`Approved for ${displayName(m)}`} />
                  </TableCell>
                  <TableCell>{tierControl(m)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end items-center gap-1">
                      {companyLinkControl(m)}
                      {!m.is_approved && (
                        <Button size="sm" disabled={promoting === m.id} onClick={() => promote(m)}>
                          {promoting === m.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Approve as Member
                        </Button>
                      )}
                      {actionsMenu(m)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">No members match your filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new member</DialogTitle>
            <DialogDescription>They receive an email invitation to set their password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="new-first">First name</Label>
                <Input id="new-first" value={newMember.firstName} onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-last">Last name</Label>
                <Input id="new-last" value={newMember.lastName} onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-company">Company</Label>
              <Input id="new-company" value={newMember.company} onChange={(e) => setNewMember({ ...newMember, company: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={newMember.role} onValueChange={(v) => setNewMember({ ...newMember, role: v as BaseRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospective_member">Prospective</SelectItem>
                  <SelectItem value="ajbn_member">AJBN Member</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              disabled={creating || !newMember.firstName.trim() || !newMember.email.trim()}
              onClick={() => void handleCreateMember()}
            >
              {creating && <Loader2 size={14} className="animate-spin" />} Add member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {confirmDelete ? displayName(confirmDelete) : "this member"}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be hidden from the directory and lose access. Their record is kept, so this can be reversed by the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void doDelete()}>Remove member</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
