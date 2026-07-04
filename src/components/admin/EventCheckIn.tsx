import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "@/hooks/use-toast";
import { QrCode, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EventCheckIn() {
  const [scanning, setScanning] = useState(false);
  const [last, setLast] = useState<{ name: string; event: string; already: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  const stop = async () => {
    try { await scannerRef.current?.stop(); } catch {}
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => () => { stop(); }, []);

  const start = async () => {
    setError(null); setLast(null);
    setScanning(true);
    try {
      const q = new Html5Qrcode("qr-reader");
      scannerRef.current = q;
      await q.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (text) => {
          if (busyRef.current) return;
          busyRef.current = true;
          const token = text.trim();
          const { data, error } = await supabase.rpc("checkin_rsvp", { _token: token });
          if (error) {
            setError(error.message);
            toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
          } else if (data && data[0]) {
            const row = data[0] as any;
            setLast({ name: row.member_name, event: row.event_title, already: row.already_checked });
            toast({ title: row.already_checked ? "Already checked in" : "Checked in", description: `${row.member_name} → ${row.event_title}` });
          }
          setTimeout(() => { busyRef.current = false; }, 1200);
        },
        () => {},
      );
    } catch (e: any) {
      setScanning(false);
      setError(e?.message ?? "Camera error");
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><QrCode /> Event check-in</h1>
        <p className="text-sm text-muted-foreground">Scan a member's RSVP QR code to check them in.</p>
      </div>

      <div id="qr-reader" className="w-full max-w-sm rounded-xl overflow-hidden border bg-black" />

      {!scanning ? (
        <Button onClick={start}>Start scanner</Button>
      ) : (
        <Button variant="outline" onClick={stop}>Stop scanner</Button>
      )}

      {last && (
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${last.already ? "bg-muted" : "bg-teal/10 border-teal/30"}`}>
          <Check className={last.already ? "text-muted-foreground" : "text-teal"} />
          <div>
            <p className="font-semibold text-sm">{last.name}</p>
            <p className="text-xs text-muted-foreground">{last.event}{last.already ? " · already checked in" : ""}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="border border-destructive/30 bg-destructive/10 text-destructive rounded-xl p-4 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
}