import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLink } from "@/components/BrandLink";

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
          <BrandLink />
          {back && (
            <>
              <span className="text-muted-foreground" aria-hidden="true">/</span>
              <Link
                to={back.to}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
              >
                <ArrowLeft size={14} /> {back.label}
              </Link>
            </>
          )}
          {headerRight && <div className="ml-auto flex items-center gap-2">{headerRight}</div>}
        </div>
      </header>
      <main className={`${mainClassName} ${MAX_W[maxWidth]}`}>{children}</main>
    </div>
  );
}