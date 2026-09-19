import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { MemberApprovals } from "@/components/admin/MemberApprovals";
import { BlocksAdmin } from "@/components/admin/BlocksAdmin";
import { MemberReportsAdmin } from "@/components/admin/MemberReportsAdmin";
import { AuditLog } from "@/components/admin/AuditLog";

/**
 * Single review screen: counts, pending approvals, blocks, reports and the
 * audit log stacked on one page so a full review needs no navigation.
 * The dedicated pages remain available for deep links and email buttons.
 */
export function ReviewOverview({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="space-y-10">
      <AnalyticsOverview pendingCount={pendingCount} />

      <section aria-labelledby="review-pending" className="space-y-4">
        <h2 id="review-pending" className="font-display text-lg font-bold text-foreground">
          Pending approvals
        </h2>
        <MemberApprovals pendingCount={pendingCount} />
      </section>

      <section aria-labelledby="review-blocks" className="space-y-4">
        <h2 id="review-blocks" className="font-display text-lg font-bold text-foreground">
          Blocks
        </h2>
        <BlocksAdmin />
      </section>

      <section aria-labelledby="review-reports" className="space-y-4">
        <h2 id="review-reports" className="font-display text-lg font-bold text-foreground">
          Member reports
        </h2>
        <MemberReportsAdmin />
      </section>

      <section aria-labelledby="review-audit" className="space-y-4">
        <h2 id="review-audit" className="font-display text-lg font-bold text-foreground">
          Admin audit log
        </h2>
        <AuditLog />
      </section>
    </div>
  );
}
