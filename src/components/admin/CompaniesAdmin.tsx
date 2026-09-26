import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listCompaniesWithReps,
  removeCompanyRep,
  setPrimaryCompanyRep,
  importCompanyServices,
  MAX_REPS_PER_COMPANY,
  type CompanyRow,
} from "@/lib/admin-companies.functions";
import { Building2, Loader2, Star, Upload, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function repBadgeClass(count: number) {
  if (count === 0) return "bg-muted text-muted-foreground";
  if (count === 1) return "bg-emerald-100 text-emerald-800";
  if (count === 2) return "bg-amber-100 text-amber-900";
  return "bg-destructive text-destructive-foreground";
}

export function CompaniesAdmin() {
  const fetchCompanies = useServerFn(listCompaniesWithReps);
  const removeRep = useServerFn(removeCompanyRep);
  const makePrimary = useServerFn(setPrimaryCompanyRep);
  const importServices = useServerFn(importCompanyServices);
  const [importing, setImporting] = useState(false);
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchCompanies());
    } catch (e: any) {
      toast({ title: "Could not load companies", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) =>
    r.company_name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onRemove = async (companyId: string, memberId: string) => {
    try {
      await removeRep({ data: { companyId, memberId } });
      toast({ title: "Representative removed" });
      await load();
    } catch (e: any) {
      toast({ title: "Could not remove", description: e?.message, variant: "destructive" });
    }
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parseLine = (line: string) => {
        const out: string[] = []; let cur = ""; let q = false;
        for (const ch of line) {
          if (ch === '"') q = !q;
          else if (ch === "," && !q) { out.push(cur); cur = ""; }
          else cur += ch;
        }
        out.push(cur);
        return out.map((s) => s.trim());
      };
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const header = parseLine(lines[0] ?? "").map((h) => h.toLowerCase());
      const ci = header.findIndex((h) => h.includes("company"));
      const si = header.findIndex((h) => h.includes("service"));
      if (ci < 0 || si < 0) throw new Error("CSV needs 'company' and 'services' columns");
      const rows = lines.slice(1).map(parseLine)
        .map((c) => ({ company: c[ci] ?? "", services: (c[si] ?? "").split(",") }))
        .filter((r) => r.company);
      const res = await importServices({ data: { rows } });
      toast({
        title: `Updated ${res.updated} companies`,
        description: [
          res.notFound.length ? `Not found: ${res.notFound.join(", ")}` : "",
          res.unknownServices.length ? `Unknown services: ${res.unknownServices.join(", ")}` : "",
        ].filter(Boolean).join(" · ") || undefined,
      });
      await load();
    } catch (err: any) {
      toast({ title: "Import failed", description: err?.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const onPrimary = async (companyId: string, memberId: string) => {
    try {
      await makePrimary({ data: { companyId, memberId } });
      toast({ title: "Primary representative set" });
      await load();
    } catch (e: any) {
      toast({ title: "Could not update", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
          <Building2 size={20} className="text-primary" /> Companies
        </h1>
        <p className="text-sm text-muted-foreground">
          Each business can have up to {MAX_REPS_PER_COMPANY} representatives.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search companies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
          <Upload size={14} /> {importing ? "Importing…" : "Import services (CSV)"}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onImport} disabled={importing} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        CSV columns: company, services — e.g. <code>ATZ Finance,"Bridging Finance, Asset Finance"</code>. Service names must match the approved list.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="overflow-hidden rounded-xl border bg-card">
              <button
                type="button"
                onClick={() => setOpenId(openId === c.id ? null : c.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.company_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[c.primary_sector, c.city].filter(Boolean).join(" • ") || "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    repBadgeClass(c.rep_count),
                  )}
                >
                  {c.rep_count}/{MAX_REPS_PER_COMPANY}
                  {c.rep_count >= MAX_REPS_PER_COMPANY ? " FULL" : ""}
                </span>
              </button>

              {openId === c.id ? (
                <div className="space-y-2 border-t bg-muted/30 px-4 py-3">
                  {Array.from({ length: MAX_REPS_PER_COMPANY }).map((_, i) => {
                    const rep = c.reps[i];
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2"
                      >
                        {rep ? (
                          <>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {rep.name}
                                {rep.is_primary ? (
                                  <span className="ml-2 text-[11px] font-semibold text-primary">
                                    Primary
                                  </span>
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[rep.title, rep.email].filter(Boolean).join(" • ") || "—"}
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              {!rep.is_primary ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => onPrimary(c.id, rep.id)}
                                >
                                  <Star size={13} /> Make primary
                                </Button>
                              ) : null}
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-destructive"
                                onClick={() => onRemove(c.id, rep.id)}
                              >
                                <UserMinus size={13} /> Remove
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Slot {i + 1} — empty</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
              No companies match that search.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
