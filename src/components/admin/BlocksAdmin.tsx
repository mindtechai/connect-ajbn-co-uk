import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMemberBlocks, unblockMember, type BlockRow } from "@/lib/admin-blocks.functions";
import { Loader2, Ban, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function BlocksAdmin() {
  const fetchBlocks = useServerFn(listMemberBlocks);
  const unblock = useServerFn(unblockMember);
  const [rows, setRows] = useState<BlockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchBlocks();
      setRows(data);
    } catch (e: any) {
      toast({ title: "Could not load blocks", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUnblock = async (id: string) => {
    try {
      await unblock({ data: { blockId: id } });
      toast({ title: "Block removed" });
      await load();
    } catch (e: any) {
      toast({ title: "Could not remove block", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Ban size={20} className="text-destructive" /> Member blocks</h1>
        <p className="text-sm text-muted-foreground">Member-to-member blocks. Removing a block restores messaging between the two members.</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No member blocks recorded.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Blocker</th>
                <th className="text-left px-4 py-3 font-medium">Blocked member</th>
                <th className="text-left px-4 py-3 font-medium">Blocked on</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{r.blocker_name}</p>
                    {r.blocker_company && <p className="text-xs text-muted-foreground">{r.blocker_company}</p>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{r.blocked_name}</p>
                    {r.blocked_company && <p className="text-xs text-muted-foreground">{r.blocked_company}</p>}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <Button size="sm" variant="outline" onClick={() => handleUnblock(r.id)} className="gap-1">
                      <Unlock size={14} /> Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
