# Make Block & Report real (not just this browser)

Today, blocking and reporting a member is saved only in the browser on the device being used. The app still tells the member "They can no longer message you" and "The AJBN team will review this within 24 hours", neither of which is true: the blocked member can still send messages, the block disappears on another device, and reports never reach the AJBN team.

## What to build

1. **Store blocks and reports in the backend**
   - New table for blocks: who blocked whom, when. Each member can read and manage only their own blocks.
   - New table for reports: reporter, reported member, reason, optional details, context (chat/profile), status. Members can create reports and see their own; only super admins can read all and update status.
   - Both tables get the standard access rules and timestamps.

2. **Enforce blocks server-side**
   - Starting or continuing a conversation fails if either side has blocked the other.
   - Sending a message fails if either side has blocked the other, so the block holds regardless of device or client.
   - Directory and inbox continue hiding blocked members, now driven by the stored list.

3. **Sync the client**
   - `src/lib/moderation.ts` becomes a thin data layer over the backend, keeping a local cache for instant UI feedback and offline reads, and reloading on sign-in.
   - `MemberSafetyMenu` shows a real success only after the write succeeds, and an error toast if it fails. Wording stays accurate.

4. **Get reports to the team**
   - A new report notifies the AJBN team by email using the existing transactional email pipeline.
   - Add a "Reports" section in the admin area listing open reports with reason, details, both members, and a way to mark reviewed or resolved.

5. **Interim honesty (applies immediately, even before the rest ships)**
   - Until server enforcement is live, the block confirmation says the member is hidden and cannot reach you *in this app on this device*, and the report toast says it has been recorded and sent to the AJBN team only once that actually happens.

## Notes

Direct messaging currently runs on local demo storage, so block enforcement is wired both into the demo message path and the backend conversation/message rules, ensuring behaviour stays consistent when messaging moves fully live. No existing member features, roles, or access rules change.
