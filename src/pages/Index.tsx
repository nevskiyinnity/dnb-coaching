import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { RiskSection } from "@/components/RiskSection";
import { ExpertiseSection } from "@/components/ExpertiseSection";
import { Services } from "@/components/Services";
import { WhoWeSeek } from "@/components/WhoWeSeek";
import { FAQ } from "@/components/FAQ";
import { ContactForm } from "@/components/ContactForm";
import { FinalPromise } from "@/components/FinalPromise";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <RiskSection />
      <ExpertiseSection />
      <Services />
      <WhoWeSeek />
      <FAQ />
      <ContactForm />
      <FinalPromise />
      <Footer />
    </div>
  );
};

export default Index;
