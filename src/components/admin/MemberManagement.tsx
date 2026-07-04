import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Crown, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Role = "super_admin" | "ajbn_member" | "impact_lion" | "prospective_member";
type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  created_at: string;
  roles: Role[];
};

const statusColors: Record<string, string> = {
  active: "bg-teal/10 text-teal border-teal/20",
  pending: "bg-primary/10 text-primary border-primary/20",
  admin: "bg-destructive/10 text-destructive border-destructive/20",
};

export function MemberManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lionsFilter, setLionsFilter] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, first_name, last_name, email, company, industry, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, Role[]>();
    for (const r of (roles ?? []) as { user_id: string; role: Role }[]) {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    }
    setMembers(((profs ?? []) as any[]).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statusOf = (m: Member) =>
    m.roles.includes("super_admin") ? "admin" :
    (m.roles.includes("ajbn_member") || m.roles.includes("impact_lion")) ? "active" :
    "pending";

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
    return matchesSearch && matchesStatus && matchesLions;
  }), [members, search, statusFilter, lionsFilter]);

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
      toast({ title: "Removed from Impact Lions" });
    } else {
      await supabase.from("user_roles").insert({ user_id: m.id, role: "impact_lion" });
      toast({ title: "Added to Impact Lions" });
    }
    load();
  };

  const suspend = async (m: Member) => {
    await supabase.from("user_roles").delete().eq("user_id", m.id).in("role", ["ajbn_member", "impact_lion"]);
    toast({ title: "Access suspended", description: `${m.first_name ?? "Member"} moved to prospective.` });
    load();
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
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((m) => {
          const st = statusOf(m);
          const isLion = m.roles.includes("impact_lion");
          return (
            <div key={m.id} className="bg-card rounded-xl border p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{m.first_name} {m.last_name}</p>
                  {isLion && <Crown size={14} className="text-gold" />}
                </div>
                <Badge className={`text-xs ${statusColors[st]}`}>{st}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{[m.company, m.industry].filter(Boolean).join(" · ") || "—"}</p>
              <p className="text-xs text-muted-foreground">Joined {new Date(m.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-card rounded-xl border shadow-sm">
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
                    <div className="flex justify-end">
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