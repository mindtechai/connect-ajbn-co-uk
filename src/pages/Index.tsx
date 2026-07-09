import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DirectMessagingPublicSection } from "@/components/landing/DirectMessagingPublicSection";
import { MembersShowcase } from "@/components/landing/MembersShowcase";
import { EventsSection } from "@/components/landing/EventsSection";
import { ImpactLionsSection } from "@/components/landing/ImpactLionsSection";
import { ReferralRewardsSection } from "@/components/landing/ReferralRewardsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Index = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hash]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <FeaturesSection />
      <DirectMessagingPublicSection />
      <MembersShowcase />
      <EventsSection />
      <ImpactLionsSection />
      <ReferralRewardsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
