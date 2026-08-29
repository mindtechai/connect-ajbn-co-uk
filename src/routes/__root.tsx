import { useEffect } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ReferralSideRibbon } from "@/components/ReferralSideRibbon";
import { OfflineFallback } from "@/components/OfflineFallback";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileTabBar } from "@/components/MobileTabBar";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Asian Jewish Business Network",
  alternateName: ["AJBN", "AJBN Connect"],
  url: "https://connect.ajbn.co.uk",
  logo: "https://connect.ajbn.co.uk/__l5e/assets-v1/679ddc11-bc98-4005-a111-6bd9d1115105/ajbn-logo.jpg",
  email: "russell@ajbn.co.uk",
  areaServed: { "@type": "City", name: "London" },
  description:
    "A premier B2B networking organisation and professional corporate event management company, delivering high-profile London business networking events, cross-communal business networking and B2B strategic partnerships.",
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AJBN Connect",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: "https://connect.ajbn.co.uk",
  description:
    "Proprietary business networking and growth application for the Asian Jewish Business Network, serving the London area with member directories, B2B matchmaking and corporate event management.",
  publisher: {
    "@type": "Organization",
    name: "Asian Jewish Business Network",
    url: "https://connect.ajbn.co.uk",
  },
  offers: { "@type": "Offer", category: "Membership" },
};

// The flagship BusinessEvent schema lives on src/routes/tickets/flagship.tsx
// so event rich results are only claimed on the event page itself.


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "google-site-verification",
        content: "ofK5u2dIfX99vuLvsM-43V2PWRH1mueSmD6_Dr_YfkA",
      },
      { title: "AJBN Connect | B2B Business Networking & Events, London" },
      {
        name: "description",
        content:
          "AJBN Connect: the digital hub for the Asian Jewish Business Network — a premier B2B networking organisation and professional corporate event management company in London.",
      },
      {
        name: "keywords",
        content:
          "high-profile London business networking events, cross-communal business networking, corporate event management and exhibitions, B2B strategic partnerships London, professional business networking club",
      },
      { name: "author", content: "AJBN" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://connect.ajbn.co.uk/" },
      {
        property: "og:title",
        content: "AJBN Connect | B2B Business Networking & Events, London",
      },
      {
        property: "og:description",
        content:
          "The digital hub for the Asian Jewish Business Network — high-profile London business networking events, corporate event management and exhibitions, and B2B strategic partnerships.",
      },
      {
        property: "og:image",
        content:
          "https://connect.ajbn.co.uk/__l5e/assets-v1/314cab37-47ab-4d26-a5f8-5ae1ca6bc1a8/ajbn-email-banner-v2.jpg",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "AJBN Connect | B2B Business Networking & Events, London",
      },
      {
        name: "twitter:description",
        content:
          "The digital hub for the Asian Jewish Business Network — a premier B2B networking organisation and corporate event management company in London.",
      },
      {
        name: "twitter:image",
        content:
          "https://connect.ajbn.co.uk/__l5e/assets-v1/314cab37-47ab-4d26-a5f8-5ae1ca6bc1a8/ajbn-email-banner-v2.jpg",
      },
      { name: "theme-color", content: "#174164" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "AJBN Connect" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://connect.ajbn.co.uk/" },
      {
        rel: "icon",
        type: "image/jpeg",
        href: "/__l5e/assets-v1/679ddc11-bc98-4005-a111-6bd9d1115105/ajbn-logo.jpg?v=2",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "apple-touch-icon",
        href: "/__l5e/assets-v1/679ddc11-bc98-4005-a111-6bd9d1115105/ajbn-logo.jpg?v=2",
      },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationSchema) },
      { type: "application/ld+json", children: JSON.stringify(softwareApplicationSchema) },
      { type: "application/ld+json", children: JSON.stringify(flagshipEventSchema) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ReferralSideRibbon />
          <OfflineFallback />
          <ScrollToTop />
          <Outlet />
          <MobileTabBar />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">This page didn&apos;t load</h1>
        <p className="text-muted-foreground text-sm">
          Something went wrong while loading this page. You can try again or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
