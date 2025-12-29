import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Wat is DNB Coaching precies?",
    answer: "DNB Coaching is een platform dat coaches helpt hun online business te starten zonder investering. Jij coacht — wij regelen marketing, sales en systemen.",
  },
  {
    question: "Hoeveel commissie verdien ik?",
    answer: "Je start met 35% en groeit tot 50% na interne training.",
  },
  {
    question: "Heb ik ervaring nodig om te starten?",
    answer: "Nee, wij leiden je volledig op via ons interne groeitraject.",
  },
  {
    question: "Hoeveel tijd moet ik erin steken?",
    answer: "Gemiddeld 2 contentdagen per maand en 20% WhatsApp-support voor je cliënten.",
  },
  {
    question: "Wat kost het om mee te doen?",
    answer: "Niets. Er zijn geen instapkosten, enkel commissiebasis — je verdient alleen aan resultaten.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Veelgestelde Vragen
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-lg px-6 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
