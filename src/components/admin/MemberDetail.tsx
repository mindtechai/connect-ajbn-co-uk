import { useEffect, useState } from "react";
import { isAppleRelayEmail } from "@/lib/apple-relay";
import { useServerFn } from "@tanstack/react-start";
import { getAdminMemberDetail, setMemberApproved, rejectMember, type AdminMemberDetail } from "@/lib/admin-members.functions";
import { useAdminScope } from "@/components/RequireSuperAdmin";
import { Loader2, ArrowLeft, User, Building2, Mail, Phone, Linkedin, Globe, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@/lib/router-compat";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function MemberDetail({ memberId }: { memberId: string }) {
  const scope = useAdminScope();
  const navigate = useNavigate();
  const fetchDetail = useServerFn(getAdminMemberDetail);
  const approve = useServerFn(setMemberApproved);
  const reject = useServerFn(rejectMember);
  const [detail, setDetail] = useState<AdminMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDetail({ data: { memberId } });
      setDetail(data);
    } catch (e: any) {
      toast({ title: "Could not load member", description: e?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [memberId]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const result = await approve({ data: { memberId, approved: true, sendWelcome: true } });
      toast({ title: "Member approved", description: result.welcomeSent ? "Welcome email sent." : "Welcome email could not be sent." });
      await load();
    } catch (e: any) {
      toast({ title: "Could not approve", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      const result = await reject({ data: { memberId, reason: rejectReason.trim() || undefined } });
      toast({ title: "Membership not approved", description: result.emailSent ? "Email sent to member." : "Could not send rejection email." });
      setRejectOpen(false);
      await load();
    } catch (e: any) {
      toast({ title: "Could not reject", description: e?.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading member details…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-destructive">
        <p>Member not found or access denied.</p>
      </div>
    );
  }

  const name = [detail.first_name, detail.last_name].filter(Boolean).join(" ").trim() || "Unnamed";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/members")} className="gap-1 pl-0">
          <ArrowLeft size={16} /> Back to members
        </Button>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-display font-bold">{name}</h1>
              {detail.is_approved ? (
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">Approved</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30">Pending</Badge>
              )}
              {detail.roles.includes("super_admin") && <Badge variant="secondary">Super admin</Badge>}
              {detail.roles.includes("impact_lion") && <Badge variant="secondary" className="text-gold border-gold/30">Impact Lion</Badge>}
            </div>
            {detail.company && <p className="text-muted-foreground flex items-center gap-1.5 mt-1"><Building2 size={14} /> {detail.company}</p>}
            {detail.title && <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5"><User size={14} /> {detail.title}</p>}
          </div>

          {scope === "full" && (
            <div className="flex flex-wrap gap-2">
              {!detail.is_approved ? (
                <Button onClick={handleApprove} disabled={busy} className="gap-1">
                  <CheckCircle size={16} /> Approve
                </Button>
              ) : (
                <Button variant="outline" onClick={async () => {
                  setBusy(true);
                  try {
                    await approve({ data: { memberId, approved: false, sendWelcome: false } });
                    toast({ title: "Approval removed" });
                    await load();
                  } catch (e: any) { toast({ title: "Error", description: e?.message, variant: "destructive" }); }
                  finally { setBusy(false); }
                }} disabled={busy}>
                  Remove approval
                </Button>
              )}
              <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={busy} className="gap-1">
                <XCircle size={16} /> Not approve
              </Button>
            </div>
          )}
        </div>

        {scope === "moderation" && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
            <ShieldAlert size={16} className="mt-0.5" />
            <span>Reviewer view: contact details and admin actions are hidden.</span>
          </div>
        )}

        <Separator className="my-5" />

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {scope === "full" && detail.email && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Email</p>
              <a href={`mailto:${detail.email}`} className="flex items-center gap-1.5 mt-1 hover:underline"><Mail size={14} /> {detail.email}{isAppleRelayEmail(detail.email) && <span className="text-xs text-muted-foreground">(Private Apple email)</span>}</a>
            </div>
          )}
          {scope === "full" && detail.phone && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Phone</p>
              <p className="flex items-center gap-1.5 mt-1"><Phone size={14} /> {detail.phone}</p>
            </div>
          )}
          {detail.linkedin && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">LinkedIn</p>
              <a href={detail.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-1 hover:underline break-all"><Linkedin size={14} /> {detail.linkedin}</a>
            </div>
          )}
          {detail.website && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Website</p>
              <a href={detail.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 mt-1 hover:underline break-all"><Globe size={14} /> {detail.website}</a>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Industry / City</p>
            <p className="mt-1">{[detail.industry, detail.city].filter(Boolean).join(" · ") || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Membership tier</p>
            <p className="mt-1 capitalize">{detail.membership_tier.replace(/_/g, " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Signed up</p>
            <p className="mt-1">{new Date(detail.created_at).toLocaleString("en-GB")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Company match</p>
            <p className="mt-1 flex items-center gap-1.5">
              {detail.hasCompanyMatch ? (
                <><CheckCircle size={14} className="text-emerald-600" /> Existing corporate member</>
              ) : (
                "—"
              )}
              {scope === "full" && detail.corporateOwnerName && ` (owner: ${detail.corporateOwnerName})`}
            </p>
          </div>
        </div>

        {detail.bio && (
          <>
            <Separator className="my-5" />
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Business description</p>
              <p className="text-sm whitespace-pre-line">{detail.bio}</p>
            </div>
          </>
        )}
      </div>

      {/* Needs/Offers */}
      <div className="bg-card border rounded-xl p-5 shadow-xs">
        <h2 className="font-display font-bold text-lg mb-3">Needs &amp; Offers</h2>
        {detail.posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="divide-y">
            {detail.posts.map((p) => (
              <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline" className="capitalize text-[10px]">{p.kind}</Badge>
                  <p className="font-medium mt-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {new Date(p.created_at).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit trail */}
      {scope === "full" && (
        <div className="bg-card border rounded-xl p-5 shadow-xs">
          <h2 className="font-display font-bold text-lg mb-3">Admin history</h2>
          {detail.audit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admin actions recorded.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {detail.audit.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <span className="font-medium">{a.action}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleString("en-GB")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not approve this member?</DialogTitle>
            <DialogDescription>
              The member will remain a prospective applicant and receive an email explaining they were not approved at this time.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional, included in the email)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={busy}>Send rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
