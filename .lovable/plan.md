Add a matching "Direct Member Messaging" CTA button to the landing page hero section, placed alongside the existing "Members Referral Rewards" button. The new button will use a teal accent variant and scroll smoothly to the #messaging instruction section.

Steps:
1. Extend `src/components/ui/button.tsx` with a new `teal` variant: `border-2 border-teal text-teal hover:bg-teal/10 font-semibold`.
2. Edit `src/components/landing/HeroSection.tsx`:
   - Import `MessageCircle` from `lucide-react`.
   - Add a new `<button>` (or `<Button>`) next to the "Members Referral Rewards" link, using `variant="teal"` and `size="xl"`.
   - Label it: "Direct Member Messaging →" or "Launch Direct Messaging →".
   - On click, call `document.getElementById('messaging')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
3. Run `bun run build` to confirm no regressions.

No other pages or business logic are affected.