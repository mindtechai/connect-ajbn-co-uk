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
import { Search, Download, Crown, MoreHorizontal, Award } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  status: "active" | "expired" | "suspended";
  isLion: boolean;
  referrals: number;
  joinDate: string;
  renewalDate: string;
}

const mockMembers: Member[] = [
  { id: "1", name: "Raj Goldstein", email: "raj@goldstein.co", company: "Goldstein Capital", industry: "Finance", status: "active", isLion: true, referrals: 8, joinDate: "Jan 2024", renewalDate: "Jan 2027" },
  { id: "2", name: "Miriam Patel", email: "miriam@mpatel.com", company: "Patel & Co", industry: "Legal", status: "active", isLion: true, referrals: 6, joinDate: "Mar 2024", renewalDate: "Mar 2027" },
  { id: "3", name: "Daniel Wong", email: "daniel@wongtech.io", company: "Wong Tech", industry: "Technology", status: "active", isLion: false, referrals: 5, joinDate: "Jun 2024", renewalDate: "Jun 2027" },
  { id: "4", name: "Rebecca Stern", email: "rebecca@sternconsult.com", company: "Stern Consulting", industry: "Consulting", status: "active", isLion: true, referrals: 4, joinDate: "Sep 2024", renewalDate: "Sep 2027" },
  { id: "5", name: "Arjun Levy", email: "arjun@levyprop.co.uk", company: "Levy Properties", industry: "Real Estate", status: "expired", isLion: false, referrals: 2, joinDate: "Jan 2024", renewalDate: "Jan 2026" },
  { id: "6", name: "Yuki Rosenfeld", email: "yuki@rosenmedia.com", company: "Rosen Media", industry: "Media", status: "active", isLion: false, referrals: 3, joinDate: "Nov 2024", renewalDate: "Nov 2027" },
  { id: "7", name: "Amit Schwartz", email: "amit@schwartz.dev", company: "Schwartz Dev", industry: "Technology", status: "suspended", isLion: false, referrals: 0, joinDate: "Feb 2025", renewalDate: "Feb 2028" },
  { id: "8", name: "Leah Nakamura", email: "leah@nakamurahealth.com", company: "Nakamura Health", industry: "Healthcare", status: "active", isLion: true, referrals: 5, joinDate: "Apr 2024", renewalDate: "Apr 2027" },
];

const statusColors: Record<string, string> = {
  active: "bg-teal/10 text-teal border-teal/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
  suspended: "bg-gold/10 text-gold border-gold/20",
};

export function MemberManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lionsFilter, setLionsFilter] = useState("all");
  const { toast } = useToast();

  const filtered = mockMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesLions =
      lionsFilter === "all" ||
      (lionsFilter === "lions" && m.isLion) ||
      (lionsFilter === "standard" && !m.isLion);
    return matchesSearch && matchesStatus && matchesLions;
  });

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${filtered.length} member records to CSV…`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Members</h1>
          <p className="text-sm text-muted-foreground">{mockMembers.length} total members</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={lionsFilter} onValueChange={setLionsFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="lions">Impact Lions</SelectItem>
            <SelectItem value="standard">Standard Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="bg-card rounded-xl border p-4 shadow-sm space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{m.name}</p>
                {m.isLion && <Crown size={14} className="text-gold" />}
              </div>
              <Badge className={`text-xs ${statusColors[m.status]}`}>{m.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{m.company} · {m.industry}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Award size={12} /> {m.referrals} referrals</span>
              <span>Joined {m.joinDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Renewal</TableHead>
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
                <TableCell>
                  <div>
                    <p className="text-sm">{m.company}</p>
                    <p className="text-xs text-muted-foreground">{m.industry}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${statusColors[m.status]}`}>{m.status}</Badge>
                </TableCell>
                <TableCell>
                  {m.isLion ? (
                    <Badge className="text-xs bg-gold/10 text-gold border-gold/20">
                      <Crown size={12} className="mr-1" /> Impact Lion
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Standard</span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums">{m.referrals}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.renewalDate}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Award Badge</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        {m.status === "active" && (
                          <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                        )}
                        {m.status === "suspended" && (
                          <DropdownMenuItem>Reactivate</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
