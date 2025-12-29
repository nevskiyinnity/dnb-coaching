import { Shield } from "lucide-react";

export const RiskSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Start zonder risico. Groei met zekerheid.
          </h2>
          
          <p className="text-xl text-muted-foreground text-center leading-relaxed">
            Bij DNB Coaching nemen wij het ondernemingsrisico weg. Geen investeringen, 
            geen verborgen kosten — alleen beloning voor jouw inzet. Zo bouw jij stap voor stap 
            een winstgevende online coachingcarrière, zonder stress over marketing of systemen.
          </p>
        </div>
      </div>
    </section>
  );
};
