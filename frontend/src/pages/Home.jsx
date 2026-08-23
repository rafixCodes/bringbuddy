import { useReveal } from "../lib/useReveal";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { TrustStrip } from "../components/TrustStrip";
import { HowItWorks } from "../components/HowItWorks";
import { ValueProps } from "../components/ValueProps";
import { MarketplacePreview } from "../components/MarketplacePreview";
import { FinalCTA } from "../components/FinalCTA";
import { Footer } from "../components/Footer";
import { ActivityToast } from "../components/ActivityToast";

function Home() {
  useReveal();
  return (
    <div className="min-h-screen bg-background text-ink">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <ValueProps />
        <MarketplacePreview />
        <FinalCTA />
      </main>
      <Footer />
      <ActivityToast />
    </div>
  );
}

export default Home;