import { Linkedin } from "lucide-react";

interface DeveloperCreditProps {
  className?: string;
  align?: "left" | "center" | "right";
}

/**
 * Small "Developed by" credit shown at the bottom of every page.
 * Links to Salil Patankar's LinkedIn profile.
 */
export function DeveloperCredit({ className = "", align = "center" }: DeveloperCreditProps) {
  const alignment =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  return (
    <p className={`text-xs text-muted-foreground ${alignment} ${className}`}>
      Developed by{" "}
      <a
        href="https://www.linkedin.com/in/salil-patankar-94892a367/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium text-teal hover:text-teal/80 transition-colors"
        aria-label="Salil Patankar on LinkedIn"
      >
        Salil Patankar
        <Linkedin className="w-3 h-3" aria-hidden="true" />
      </a>{" "}
      — creator of the AJBN Deal Orchestrator.
    </p>
  );
}