import { Shield, Bell, Mail, ExternalLink, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AdminSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield size={20} className="text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted-foreground">Portal-wide configuration and admin tools.</p>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h2 className="font-semibold text-sm">Super admin whitelist</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          The following email addresses are automatically granted the <span className="font-mono text-foreground">super_admin</span> role on email verification:
        </p>
        <ul className="text-sm space-y-1 pl-4 list-disc text-foreground">
          <li>russell@ajbn.co.uk</li>
          <li>salil@ajbn.co.uk</li>
        </ul>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-primary" />
          <h2 className="font-semibold text-sm">Communications</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Compose announcements and targeted messages, and review delivery status per recipient.
        </p>
        <Link to="/admin/bulk-actions">
          <Button variant="outline" size="sm" className="gap-1.5">Open Bulk Actions <ExternalLink size={12} /></Button>
        </Link>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h2 className="font-semibold text-sm">Members' preferences</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Members manage their own in-app and email notification preferences at{" "}
          <span className="font-mono text-foreground">/settings/notifications</span>. Category-level toggles are honored by every bulk message.
        </p>
      </div>
    </div>
  );
}