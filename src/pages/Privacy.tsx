import { AppLayout } from "@/components/AppLayout";
import {
  Building2,
  Database,
  ShieldCheck,
  Users,
  Clock,
  UserCheck,
  Baby,
  RefreshCw,
  Mail,
  Check,
  X,
} from "lucide-react";

const SECTION_H2 =
  "font-display text-xl md:text-2xl font-semibold text-primary flex items-center gap-2.5 mb-3";
const ICON = "w-5 h-5 text-[hsl(var(--lions-gold))] shrink-0";

export default function PrivacyPage() {
  return (
    <AppLayout back={{ to: "/", label: "Home" }} maxWidth="3xl">
      <article className="max-w-none">
        <header className="mb-8 border-b pb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
            Privacy Policy – AJBN Network App
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last Updated:</span> September 2026
          </p>
        </header>

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <Building2 className={ICON} aria-hidden="true" /> 1. Who We Are
          </h2>
          <ul className="space-y-1.5 text-foreground/90 leading-relaxed">
            <li><strong>AJBNETWORK LTD</strong> ("we", "us", "our")</li>
            <li><strong>Address:</strong> 13 Caddis Close, Stanmore, HA7 3TL, United Kingdom</li>
            <li><strong>ICO Registration:</strong> ZC068696</li>
          </ul>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            We're committed to protecting your privacy under UK GDPR and the Data Protection Act 2018.
          </p>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <Database className={ICON} aria-hidden="true" /> 2. What Data We Collect
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            When you use the AJBN Network app, we collect:
          </p>
          <ul className="mt-3 space-y-2 text-foreground/90">
            <li><strong>Your Profile:</strong> Name, job title, industry, company, bio</li>
            <li><strong>Contact Info (Private):</strong> Email and phone number — we keep these hidden from other users</li>
            <li><strong>Activity:</strong> Messages you send, connections you make</li>
            <li><strong>Technical Data:</strong> Device type, app version, crash reports (to fix bugs)</li>
          </ul>

          <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
            <p className="font-semibold text-foreground mb-2">We never collect:</p>
            <ul className="space-y-1.5 text-foreground/90 text-sm md:text-base">
              {[
                "Your location",
                "Your contacts or calendar",
                "Your photos or files (unless you choose to share them in the app)",
                "Any data for ads or tracking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <X className="w-4 h-4 mt-1 text-destructive shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <ShieldCheck className={ICON} aria-hidden="true" /> 3. How We Protect Your Data
          </h2>
          <ul className="space-y-3 text-foreground/90">
            {[
              ["Your email and phone are never shown publicly.", "They're masked — other users can only message you through the app."],
              ["Secure connections:", "All data travels encrypted (like your bank's website)."],
              ["No selling your data:", "We never sell, trade, or share your information for money."],
              ["Your control:", "You can update, delete, or download your profile anytime in the app settings."],
            ].map(([bold, rest]) => (
              <li key={bold} className="flex items-start gap-2.5">
                <Check className="w-5 h-5 mt-0.5 text-[hsl(var(--ajbn-teal))] shrink-0" aria-hidden="true" />
                <span><strong>{bold}</strong> {rest}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <Users className={ICON} aria-hidden="true" /> 4. Who Can Access Your Data
          </h2>
          <ul className="space-y-2 text-foreground/90">
            <li><strong>You</strong> — full access to your own profile</li>
            <li><strong>Other users</strong> — only your name, title, company, and bio (if you choose to make them visible)</li>
            <li><strong>Our team</strong> — only to support you or fix technical issues</li>
            <li><strong>Legal authorities</strong> — only if required by law</li>
          </ul>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <Clock className={ICON} aria-hidden="true" /> 5. How Long We Keep Your Data
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            We keep your data while your account is active. If you delete your account, we remove your
            profile within 30 days. Some technical logs may be kept longer for security.
          </p>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <UserCheck className={ICON} aria-hidden="true" /> 6. Your Rights
          </h2>
          <p className="text-foreground/90 leading-relaxed">You can:</p>
          <ul className="mt-3 space-y-2 text-foreground/90">
            <li>Download a copy of your data</li>
            <li>Edit or delete your profile anytime</li>
            <li>Change privacy settings for your visibility</li>
            <li>
              Contact us with questions:{" "}
              <a href="mailto:support@ajbn.co.uk" className="font-medium text-teal underline underline-offset-2 hover:text-teal/80">
                support@ajbn.co.uk
              </a>
            </li>
          </ul>
          <p className="mt-3 text-foreground/90 leading-relaxed">
            If you're unhappy with how we handle your data, you can lodge a complaint with the
            Information Commissioner's Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="font-medium text-teal underline underline-offset-2 hover:text-teal/80">
              ico.org.uk
            </a>.
          </p>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <Baby className={ICON} aria-hidden="true" /> 7. Children's Privacy
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            This app is for professionals 16+. We don't knowingly collect data from children under 16.
          </p>
        </section>

        <hr className="my-10 border-border" />

        <section className="mb-10">
          <h2 className={SECTION_H2}>
            <RefreshCw className={ICON} aria-hidden="true" /> 8. Changes to This Policy
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            We may update this policy occasionally. We'll tell you about big changes via email or in the app.
          </p>
        </section>

        <div className="rounded-lg border border-[hsl(var(--ajbn-teal))]/30 bg-[hsl(var(--ajbn-sky))]/50 p-5 flex items-start gap-3">
          <Mail className="w-5 h-5 mt-0.5 text-[hsl(var(--ajbn-navy))] shrink-0" aria-hidden="true" />
          <p className="text-foreground leading-relaxed">
            <strong>Questions?</strong> Email us:{" "}
            <a href="mailto:support@ajbn.co.uk" className="font-medium underline underline-offset-2">
              support@ajbn.co.uk
            </a>
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
