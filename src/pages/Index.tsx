import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MembersShowcase } from "@/components/landing/MembersShowcase";
import { ImpactLionsSection } from "@/components/landing/ImpactLionsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <FeaturesSection />
      <MembersShowcase />
      <ImpactLionsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
