Implement a continuous registration pipeline for networking events by adding a persistent, always-on card that automatically appears whenever the most recent specific event has passed and no definite future date is announced.

### Changes planned

1. `src/components/landing/EventsSection.tsx` (primary target)
   - Add a new `PIPELINE_EVENT` constant for the generic next networking event:
     - Title: "Upcoming Bimonthly In-Person Networking Event"
     - Location: "London (Venue TBA)"
     - CTA: "Register Your Interest" (active, not disabled)
   - Add a helper that checks whether the most recent specific event (with a definite date) has already ended.
   - When the helper returns true, prepend or insert the pipeline card into the visible events list so it renders as a high-priority networking card.
   - Make the CTA fully active: open the existing registration dialog and store the interest in `event_interests` with a dedicated event ID (`upcoming-bimonthly-networking`), so duplicates are still blocked and confirmation emails are sent.

2. `src/pages/Events.tsx` (mirror if required)
   - Add the same pipeline card logic to the dedicated events page so signed-in members see the same continuous registration option when the next bimonthly date is unannounced.
   - Keep the existing disabled "Keep Me Updated" placeholders for the September/December placeholders untouched.

### Scope boundaries
- This is purely a UI-state change: no new database tables, no new API endpoints, no new edge functions.
- The pipeline card will use the existing `event_interests` table and the existing `handleRegister` flow for member verification/duplication handling, so no new backend work is required.
- The "Register Your Interest" button will be enabled for the pipeline card only; existing placeholder cards remain disabled.
- No changes to event filtering, tabs, or branding.