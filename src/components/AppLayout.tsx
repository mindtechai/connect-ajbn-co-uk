import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLink } from "@/components/BrandLink";
import { DeveloperCredit } from "@/components/DeveloperCredit";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";

const MAX_W: Record<MaxWidth, string> = {
  sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl",
  "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl",
  "5xl": "max-w-5xl", "6xl": "max-w-6xl", "7xl": "max-w-7xl",
  full: "max-w-full",
};

export interface AppLayoutProps {
  children: React.ReactNode;
  /** Back-link shown after the brand. Pass `null` to hide. Defaults to Dashboard. */
  back?: { to: string; label: string } | null;
  /** Extra content aligned to the right of the header. */
  headerRight?: React.ReactNode;
  /** Constrains `<main>` width. Defaults to 4xl. */
  maxWidth?: MaxWidth;
  /** Custom padding classes for `<main>`. */
  mainClassName?: string;
}

const DEFAULT_BACK = { to: "/dashboard", label: "Dashboard" };

export function AppLayout({
  children,
  back = DEFAULT_BACK,
  headerRight,
  maxWidth = "4xl",
  mainClassName = "container mx-auto px-4 lg:px-8 py-8",
}: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Skip link: appears on keyboard focus, jumps past the header */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>

      <header
        className="border-b bg-card sticky top-0 z-40"
        role="banner"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <nav
          aria-label="Primary"
          className="container mx-auto px-4 lg:px-8 h-20 flex items-center gap-3"
        >
          <BrandLink />
          {back && (
            <>
              <span className="text-muted-foreground/70" aria-hidden="true">/</span>
              <Link
                to={back.to}
                aria-label={`Back to ${back.label}`}
                className="text-foreground/80 hover:text-foreground focus-visible:text-foreground flex items-center gap-1.5 text-sm font-medium rounded-md px-1 -mx-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card min-h-11 min-w-11 sm:min-h-0 sm:min-w-0"
              >
                <ArrowLeft size={14} aria-hidden="true" focusable="false" />
                <span>{back.label}</span>
              </Link>
            </>
          )}
          {headerRight && <div className="ml-auto flex items-center gap-2">{headerRight}</div>}
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className={`${mainClassName} ${MAX_W[maxWidth]} focus:outline-none pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-8`}
      >
        {children}
      </main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <DeveloperCredit />
          <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}