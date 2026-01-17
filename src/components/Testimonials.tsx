import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Magdalene Foundation brought our scattered family together. My children now know their great-grandmother's stories.",
    author: "Thabo Molefe",
    role: "Third Generation, Molefe Circle",
    avatar: "TM",
  },
  {
    quote: "I discovered cousins I never knew existed. The family tree visualization is simply beautiful.",
    author: "Lerato Kgosana",
    role: "Founding Superuser, Kgosana Circle",
    avatar: "LK",
  },
  {
    quote: "MAGGIE helped me record my mother's recipes before she passed. These memories are priceless.",
    author: "Mpho Tau",
    role: "Second Generation, Tau Circle",
    avatar: "MT",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Stories From Our Families
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from families who've made Magdalene Foundation their digital home.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-card border border-sage-100 h-full">
                <Quote className="w-10 h-10 text-sage-200 mb-4" />
                <p className="text-foreground leading-relaxed mb-6 font-display italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
