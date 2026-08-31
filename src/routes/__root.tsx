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

const ORG_ID = "https://connect.ajbn.co.uk/#organization";
const PLATFORM_ID = "https://connect.ajbn.co.uk/#platform";
const LIONS_ID = "https://connect.ajbn.co.uk/lions#organization";

// Entity hierarchy: AJBN (parent organisation) → AJBN Connect (its digital
// member platform), AJBN Capital Connect (one specialist component of AJBN),
// AJBN events, AJBN Impact Lions Club (charitable arm).
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Asian Jewish Business Network",
  alternateName: ["AJBN"],
  url: "https://connect.ajbn.co.uk",
  logo: "https://connect.ajbn.co.uk/__l5e/assets-v1/679ddc11-bc98-4005-a111-6bd9d1115105/ajbn-logo.jpg",
  email: "russell@springadconsultancy.co.uk",
  areaServed: { "@type": "City", name: "London" },
  description:
    "A multidisciplinary B2B business and professional network bringing together businesses, professionals, entrepreneurs and organisations across many sectors, and a professional corporate event management company delivering high-profile London business networking events and cross-communal business networking.",
  knowsAbout: [
    "business networking in London",
    "cross-communal business networking",
    "solicitors and legal professionals",
    "barristers",
    "accountants",
    "tax advisers",
    "architects",
    "surveyors",
    "capital allowances specialists",
    "property professionals",
    "construction professionals",
    "technology businesses",
    "marketing professionals",
    "business advisers",
    "professional and commercial services",
    "corporate event management and exhibitions",
  ],
  owns: { "@id": PLATFORM_ID },
  subOrganization: [
    {
      "@type": "Organization",
      "@id": LIONS_ID,
      name: "AJBN Impact Lions Club",
      url: "https://connect.ajbn.co.uk/lions",
      parentOrganization: { "@id": ORG_ID },
      description:
        "The charitable initiative of the Asian Jewish Business Network, raising funds through AJBN events and member contributions.",
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AJBN member services",
    url: "https://connect.ajbn.co.uk/services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AJBN Capital Connect",
          serviceType: "Member networking and business introductions",
          url: "https://connect.ajbn.co.uk/services#capital-connect",
          provider: { "@id": ORG_ID },
          isRelatedTo: { "@id": ORG_ID },
          description:
            "AJBN's member networking and business/professional introduction initiative. Where a member identifies a business need, AJBN may identify a relevant professional or business connection within its network and, at the member's request, facilitate an introduction. The parties communicate and contract independently. AJBN does not provide financial advice, recommend financial products or negotiate transactions.",
        },
      },
    ],
  },

};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://connect.ajbn.co.uk/#website",
  name: "AJBN Connect",
  alternateName: "Asian Jewish Business Network member platform",
  url: "https://connect.ajbn.co.uk",
  publisher: { "@id": ORG_ID },
  about: { "@id": ORG_ID },
  mainEntity: { "@id": PLATFORM_ID },
  description:
    "AJBN Connect is the digital member platform of the Asian Jewish Business Network, covering the member directory, AJBN events, member introductions and the AJBN Impact Lions Club.",
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": PLATFORM_ID,
  name: "AJBN Connect",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: "https://connect.ajbn.co.uk",
  isPartOf: { "@id": "https://connect.ajbn.co.uk/#website" },
  about: { "@id": ORG_ID },
  provider: { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
  description:
    "The digital member platform operated by the Asian Jewish Business Network, providing member directories, B2B matchmaking and event management for the multidisciplinary AJBN network in London.",
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
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(organizationSchema) },
      { type: "application/ld+json", children: JSON.stringify(softwareApplicationSchema) },
      { type: "application/ld+json", children: JSON.stringify(webSiteSchema) },
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
