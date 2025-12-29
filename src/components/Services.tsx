import { Card, CardContent } from "@/components/ui/card";
import fitnessImage from "@/assets/fitness-coaching.jpg";
import healthImage from "@/assets/health-coaching.jpg";
import mindsetImage from "@/assets/mindset-coaching.jpg";

const services = [
  {
    title: "Fitness Coaching",
    description: "Word de coach die anderen helpt fysiek te transformeren met bewezen methodes en gepersonaliseerde schema's.",
    image: fitnessImage,
  },
  {
    title: "Health Coaching",
    description: "Leer hoe je klanten begeleidt naar een gezondere levensstijl met duurzame resultaten.",
    image: healthImage,
  },
  {
    title: "Mindset Coaching",
    description: "Ontwikkel de mentale kracht om jezelf én anderen te helpen doorbreken.",
    image: mindsetImage,
  },
];

export const Services = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Wat wij samen met jou opbouwen
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Onze programma's helpen jou groeien als coach — op elk niveau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
              </div>
              <CardContent className="p-6 space-y-3">
                <h3 className="text-2xl font-semibold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
