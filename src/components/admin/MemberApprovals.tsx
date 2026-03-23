import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Check, X, Search, Eye, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingMember {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  referredBy: string | null;
  appliedDate: string;
  lionsInterest: boolean;
}

const mockPending: PendingMember[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@techco.com", company: "TechCo Ltd", industry: "Technology", referredBy: "Raj Goldstein", appliedDate: "18 Mar 2026", lionsInterest: true },
  { id: "2", name: "David Levy", email: "david@fingroup.com", company: "FinGroup", industry: "Finance", referredBy: "Miriam Patel", appliedDate: "17 Mar 2026", lionsInterest: false },
  { id: "3", name: "Anika Shah", email: "anika@legalcorp.co.uk", company: "LegalCorp", industry: "Legal", referredBy: null, appliedDate: "16 Mar 2026", lionsInterest: true },
  { id: "4", name: "James Rothberg", email: "james@propdev.com", company: "PropDev", industry: "Real Estate", referredBy: "Raj Goldstein", appliedDate: "15 Mar 2026", lionsInterest: false },
  { id: "5", name: "Priya Weinstein", email: "priya@healthplus.co.uk", company: "HealthPlus", industry: "Healthcare", referredBy: null, appliedDate: "14 Mar 2026", lionsInterest: true },
  { id: "6", name: "Michael Tang", email: "michael@mediaco.com", company: "MediaCo", industry: "Media", referredBy: "David Levy", appliedDate: "14 Mar 2026", lionsInterest: false },
];

export function MemberApprovals() {
  const [pending, setPending] = useState(mockPending);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const filtered = pending.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "referred" && m.referredBy) ||
      (filter === "direct" && !m.referredBy) ||
      (filter === "lions" && m.lionsInterest);
    return matchesSearch && matchesFilter;
  });

  const handleApprove = (id: string) => {
    const member = pending.find((m) => m.id === id);
    setPending((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: "Member Approved",
      description: `${member?.name} has been approved and will receive a welcome email.`,
    });
  };

  const handleReject = (id: string) => {
    const member = pending.find((m) => m.id === id);
    setPending((prev) => prev.filter((m) => m.id !== id));
    toast({
      title: "Application Declined",
      description: `${member?.name}'s application has been declined.`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">
          {pending.length} application{pending.length !== 1 && "s"} awaiting review
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="referred">Referred Only</SelectItem>
            <SelectItem value="direct">Direct Only</SelectItem>
            <SelectItem value="lions">Lions Interest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card rounded-xl border p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{m.name}</p>
                  {m.lionsInterest && <Crown size={14} className="text-gold" />}
                </div>
                <p className="text-xs text-muted-foreground">{m.company} · {m.industry}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {m.appliedDate}
              </Badge>
            </div>
            {m.referredBy && (
              <p className="text-xs text-muted-foreground">
                Referred by <span className="font-medium text-foreground">{m.referredBy}</span>
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => handleApprove(m.id)}>
                <Check size={14} /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleReject(m.id)}>
                <X size={14} />
              </Button>
              <Button size="sm" variant="ghost">
                <Eye size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Lions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{m.company}</TableCell>
                <TableCell className="text-sm">{m.industry}</TableCell>
                <TableCell className="text-sm">
                  {m.referredBy ? (
                    <Badge variant="secondary" className="text-xs">{m.referredBy}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Direct</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.appliedDate}</TableCell>
                <TableCell>
                  {m.lionsInterest && <Crown size={14} className="text-gold" />}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="sm" onClick={() => handleApprove(m.id)}>
                      <Check size={14} /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(m.id)}>
                      <X size={14} />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No pending applications match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
