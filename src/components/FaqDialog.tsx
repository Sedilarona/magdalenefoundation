import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "What is the Magdalene Foundation app?",
    a: "A digital home for our extended family — a private, invitation-only space to preserve genealogy, share stories, celebrate milestones and stay connected across generations.",
  },
  {
    q: "Who can join?",
    a: "Access is invitation-only. New members are added by family administrators. There is no public sign-up.",
  },
  {
    q: "What can I do inside the app?",
    a: "Explore the Family Tree, read and share Tales, browse the Library and Family Resources (hymns, scriptures, recipes), play Family Tricks together, and chat with MAGGIE, our family AI.",
  },
  {
    q: "Who is MAGGIE?",
    a: "MAGGIE is our digital matriarch — an AI assistant that knows the family tree, tales, hymns and announcements, and helps you find relatives, learn history and preserve memories.",
  },
  {
    q: "What is the family motto?",
    a: "\"Sethare se segologolo, Sethare se setona, Sethare Moriti o tsidididi, Sethare se maungo a monate…\" — The ancient tree, the mighty tree, the tree of cool shade, the tree of sweet fruit.",
  },
  {
    q: "How is my data protected?",
    a: "Family data lives in an isolated Family Circle with strict access controls. Only invited members can see it, and sensitive contact details are never shared without permission.",
  },
  {
    q: "Can I edit my profile?",
    a: "Yes — go to My Profile to update your name, generation, location, occupation, phone and the services you offer to the family community.",
  },
  {
    q: "How do birthday announcements work?",
    a: "Birthdays you add to your profile are tracked automatically and celebrated in the monthly announcements feed.",
  },
];

export const FaqDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          FAQ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Frequently Asked Questions</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};
