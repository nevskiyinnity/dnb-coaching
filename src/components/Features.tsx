import { Target, TrendingUp, Globe, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Ontwikkel je online coachingvaardigheden",
    description: "Leer hoe je een succesvolle fitness-, health- of mindsetcoach wordt met bewezen strategieën en begeleiding van ons team.",
  },
  {
    icon: TrendingUp,
    title: "Tot 50% commissies voor jou",
    description: "Verdien tot 50% commissie op elke verkoop, volledig prestatiegericht en transparant.",
  },
  {
    icon: Globe,
    title: "Wereldwijde impact & vrijheid",
    description: "Werk waar je wilt, wanneer je wilt — bouw een merk dat wereldwijd inspireert.",
  },
  {
    icon: Users,
    title: "Word deel van de DNB Community",
    description: "Sluit je aan bij een groeiende groep coaches die elkaar ondersteunen, groeien en successen delen.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
