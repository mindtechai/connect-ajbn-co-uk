import { AppLayout } from "@/components/AppLayout";

export default function PrivacyPage() {
  return (
    <AppLayout back={{ to: "/", label: "Home" }} maxWidth="3xl">
      <article className="prose prose-slate max-w-none">
        <header className="mb-8 border-b pb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
            Privacy Policy &amp; Data Protection Statement
          </h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last Updated:</span> July 2026
          </p>
        </header>

        <p className="text-base leading-relaxed text-foreground/90">
          Welcome to the AJBN Connect &amp; Impact platform, operated by{" "}
          <strong>AJBNETWORK LTD</strong> ("we", "us", or "our"). We are committed to
          protecting your privacy in strict accordance with the UK GDPR and the
          Data Protection Act 2018.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-primary border-l-4 border-[hsl(var(--lions-gold))] pl-3 mb-3">
            1. Important Information &amp; Who We Are
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            AJBNETWORK LTD is the designated Data Controller responsible for your
            personal data.
          </p>
          <ul className="mt-3 space-y-1.5 text-foreground/90">
            <li><strong>Company Name:</strong> AJBNETWORK LTD</li>
            <li><strong>Registered Address:</strong> 13 Caddis Close, Stanmore, HA7 3TL, United Kingdom</li>
            <li><strong>ICO Registration Reference:</strong> ZC068696</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-primary border-l-4 border-[hsl(var(--lions-gold))] pl-3 mb-3">
            2. The Data We Collect About You
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            We collect and store your professional bio, name, industry, and corporate
            profile details.
          </p>
          <div className="mt-4 rounded-lg border border-[hsl(var(--ajbn-teal))]/30 bg-[hsl(var(--ajbn-sky))]/50 p-4">
            <p className="text-sm md:text-base leading-relaxed text-foreground">
              <strong className="text-[hsl(var(--ajbn-navy))]">CRITICAL PRIVACY SAFEGUARD:</strong>{" "}
              Your personal email address and mobile phone number are completely
              restricted from public display in the Member Directory. All
              peer-to-peer interactions and direct messaging services route
              strictly via masked database tokens to keep your raw contact
              details completely secure.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl md:text-2xl font-semibold text-primary border-l-4 border-[hsl(var(--lions-gold))] pl-3 mb-3">
            3. Data Disclosures &amp; Your Security
          </h2>
          <ul className="mt-2 space-y-3 text-foreground/90 leading-relaxed">
            <li>
              We maintain a strict <strong>zero-sharing policy</strong> for
              commercial gain. We never sell or trade your data.
            </li>
            <li>
              Data transactions are protected via verified JSON Web Tokens (JWT)
              and strict Row-Level Security (RLS) policies.
            </li>
            <li>
              You hold the absolute right to access, rectify, or erase your data
              profile at any time. For concerns, you have the right to lodge a
              formal complaint with the Information Commissioner's Office (ICO).
            </li>
          </ul>
        </section>
      </article>
    </AppLayout>
  );
}