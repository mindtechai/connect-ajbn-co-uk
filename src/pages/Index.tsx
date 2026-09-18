import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DirectMessagingPublicSection } from "@/components/landing/DirectMessagingPublicSection";
import { MembersShowcase } from "@/components/landing/MembersShowcase";
import { EventsSection } from "@/components/landing/EventsSection";
import { FlagshipEventSEOSection } from "@/components/landing/FlagshipEventSEOSection";

import { ImpactLionsSection } from "@/components/landing/ImpactLionsSection";
import { ReferralRewardsSection } from "@/components/landing/ReferralRewardsSection";
import { DirectMessagingTeaserSection } from "@/components/landing/DirectMessagingTeaserSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useEffect } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

const Index = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // App Store reviewer signs in and lands straight on the moderation tools.
  useEffect(() => {
    if (loading) return;
    if (user?.email === REVIEWER_EMAIL) navigate("/admin/blocks", { replace: true });
  }, [loading, user?.email, navigate]);

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hash]);
  return (
    <div className="min-h-screen pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-0">
      <Navbar />
      <HeroSection />
      <FlagshipEventSEOSection />
      <StatsSection />

      <AboutSection />
      <FeaturesSection />
      <DirectMessagingPublicSection />
      <MembersShowcase />
      <EventsSection />
      <ImpactLionsSection />
      <DirectMessagingTeaserSection />
      <ReferralRewardsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
