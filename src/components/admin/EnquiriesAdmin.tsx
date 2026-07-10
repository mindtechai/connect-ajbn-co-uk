import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Row {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service_type: string;
  message: string | null;
}

export function EnquiriesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("service_enquiries")
        .select("id,created_at,name,email,service_type,message")
        .order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.service_type.toLowerCase().includes(s),
    );
  }, [rows, q]);

  return (
    <div className="p-4 lg:p-8 space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Service Enquiries</h1>
        <p className="text-sm text-muted-foreground">Added Value Services submissions</p>
      </div>
      <Input
        placeholder="Filter by name or service type…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />
      <div className="border rounded-lg bg-card">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No enquiries found</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-sm">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{r.service_type}</TableCell>
                  <TableCell className="text-sm max-w-md whitespace-pre-wrap">{r.message ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}