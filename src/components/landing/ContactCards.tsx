import { Mail, User } from "lucide-react";

const contacts = [
  {
    heading: "Membership & General Referrals",
    name: "Russell Bahar (Founder & CEO)",
    email: "Russell@ajbn.co.uk",
    description:
      "For all general network enquiries, membership applications, renewals, sponsorship and referral reward queries.",
  },
  {
    heading: "Capital Connect & Deal Matching",
    name: "Salil Patankar (Capital Connect Lead)",
    email: "Salil@ajbn.co.uk",
    description:
      "For developers seeking funds, investors, banks and bridging companies looking for capital deployment, or professional advisors structuring network transactions.",
  },
];

export function ContactCards({ className }: { className?: string }) {
  return (
    <div className={`grid sm:grid-cols-2 gap-5 ${className || ""}`}>
      {contacts.map((c) => (
        <div
          key={c.heading}
          className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-gold" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-semibold leading-tight">
              {c.heading}
            </h3>
          </div>
          <div className="mb-3">
            <p className="text-sm font-semibold text-foreground">{c.name}</p>
            <a
              href={`mailto:${c.email}`}
              className="inline-flex items-center gap-2 text-sm text-teal hover:text-teal/80 transition-colors"
              aria-label={`Email ${c.email}`}
            >
              <Mail size={14} />
              {c.email}
            </a>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
            {c.description}
          </p>
        </div>
      ))}
    </div>
  );
}
