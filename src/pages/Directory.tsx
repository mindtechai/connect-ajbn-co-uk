import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Crown, Loader2, Building2, Mail, Linkedin } from "lucide-react";

type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  bio: string | null;
  email: string | null;
  linkedin: string | null;
  is_lion: boolean;
};

export default function DirectoryPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("all");

  const canAccess = roles.includes("ajbn_member") || roles.includes("impact_lion") || roles.includes("super_admin");

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const [{ data: profs }, { data: memberRoles }] = await Promise.all([
        supabase.from("profiles")
          .select("id, first_name, last_name, company, title, industry, bio, email, linkedin")
          .order("last_name", { ascending: true }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const lionSet = new Set(((memberRoles ?? []) as any[]).filter((r) => r.role === "impact_lion").map((r) => r.user_id));
      setMembers(((profs ?? []) as any[]).map((p) => ({ ...p, is_lion: lionSet.has(p.id) })));
      setLoading(false);
    })();
  }, [user, authLoading]);

  const industries = useMemo(() => {
    const s = new Set<string>();
    members.forEach((m) => m.industry && s.add(m.industry));
    return Array.from(s).sort();
  }, [members]);

  const filtered = useMemo(() => members.filter((m) => {
    const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.toLowerCase();
    const search = q.toLowerCase();
    const okQ = !search || name.includes(search) || (m.company ?? "").toLowerCase().includes(search) || (m.title ?? "").toLowerCase().includes(search);
    const okInd = industry === "all" || m.industry === industry;
    return okQ && okInd;
  }), [members, q, industry]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Member Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse the AJBN community. Only active members can see other members.
          </p>
        </div>

        {!canAccess ? (
          <div className="bg-card border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Your application is under review. Once approved, the directory unlocks automatically.</p>
          </div>
        ) : loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name, company or title…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Showing {filtered.length} of {members.length} members
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <div key={m.id} className="bg-card border rounded-xl p-5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{m.first_name} {m.last_name}</p>
                      {m.title && <p className="text-xs text-muted-foreground truncate">{m.title}</p>}
                    </div>
                    {m.is_lion && <Crown size={16} className="text-gold shrink-0" />}
                  </div>
                  {m.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 size={12} /> {m.company}
                    </p>
                  )}
                  {m.industry && <Badge variant="outline" className="text-[10px]">{m.industry}</Badge>}
                  {m.bio && <p className="text-xs text-muted-foreground line-clamp-3 pt-1">{m.bio}</p>}
                  <div className="flex gap-2 pt-2 border-t">
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Mail size={12} /> Email
                      </a>
                    )}
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Linkedin size={12} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-12">No members match your filters.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}