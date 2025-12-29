import { Button } from "@/components/ui/button";

export const FinalPromise = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-32 relative">
      {/* Large glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[150px] -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Onze belofte aan jou
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Wij geloven dat iedereen de kans verdient om een impact te maken — zonder investering, 
            zonder risico, maar mét echte begeleiding.
          </p>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Bij DNB Coaching krijg je meer dan alleen een platform. Je krijgt een team dat met je meedenkt, 
            je begeleidt, en je helpt bouwen aan jouw toekomst als coach. Wij investeren in jou, 
            zodat jij kunt investeren in anderen.
          </p>

          <div className="pt-8">
            <p className="text-3xl font-bold text-primary mb-8">
              Jouw groei is ons succes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={scrollToContact}
              >
                Word Coach
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={scrollToContact}
              >
                Plan een kennismaking
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
