export const ExpertiseSection = () => {
  return (
    <section className="py-24 relative">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            Wij bouwen coaches, geen freelancers.
          </h2>
          
          <p className="text-xl text-muted-foreground text-center leading-relaxed">
            Ons team combineert jarenlange ervaring in online coaching, sales en marketing. 
            We weten precies wat er nodig is om van een passie een duurzame business te maken. 
            Met onze begeleiding, tools en community sta jij er nooit alleen voor.
          </p>
        </div>
      </div>
    </section>
  );
};
