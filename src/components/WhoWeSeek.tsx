import { Card, CardContent } from "@/components/ui/card";
import { Heart, Rocket, Sparkles } from "lucide-react";

const profiles = [
  {
    icon: Heart,
    title: "Inspirerend Verhaal",
    description: "We zoeken mensen die iets hebben meegemaakt en dat willen gebruiken om anderen te helpen. Of je nu fysiek, mentaal of persoonlijk bent gegroeid — jouw ervaring kan anderen inspireren om hetzelfde te doen.",
  },
  {
    icon: Rocket,
    title: "Actie Ondernemen",
    description: "We werken met mensen die actie ondernemen. Niet wachten op het perfecte moment, maar het gewoon doen. Je hebt motivatie, discipline en de wil om te groeien — wij geven je de tools.",
  },
  {
    icon: Sparkles,
    title: "Positieve Impact",
    description: "DNB Coaching is er voor mensen die positief willen bijdragen aan de wereld. Jij bent iemand die anderen wil begeleiden, motiveren en helpen hun potentieel te bereiken — op jouw manier.",
  },
];

export const WhoWeSeek = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            We zoeken geen perfecte coaches —{" "}
            <span className="text-primary text-glow">we zoeken echte mensen</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bij DNB Coaching draait het niet om diploma's of ervaring. Wij bouwen aan een community 
            van mensen met energie, karakter en een verhaal dat anderen kan inspireren.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {profiles.map((profile, index) => (
            <Card 
              key={index} 
              className="group hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
            >
              <CardContent className="p-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <profile.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold">{profile.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{profile.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-2xl font-semibold text-muted-foreground italic">
            We zoeken geen experts, maar mensen met drive.
          </p>
        </div>
      </div>
    </section>
  );
};
