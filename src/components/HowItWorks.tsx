import { motion } from "framer-motion";
import { UserPlus, GitBranch, Users, Heart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Circle",
    description: "Start a new Family Circle and invite your relatives. Become a founding Superuser of your digital family home.",
  },
  {
    icon: GitBranch,
    step: "02",
    title: "Build Your Tree",
    description: "Add family members, connect relationships, and watch your family tree grow across generations.",
  },
  {
    icon: Users,
    step: "03",
    title: "Invite & Connect",
    description: "Family members claim their profiles, add their stories, and contribute to the shared legacy.",
  },
  {
    icon: Heart,
    step: "04",
    title: "Preserve & Grow",
    description: "Record tales, share recipes, play games, and let MAGGIE help you discover family connections.",
  },
];

export const HowItWorks = () => {
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started is simple. In just a few steps, your family's digital home will be ready.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-sage-200 via-sage-300 to-sage-200" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Circle */}
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center shadow-soft">
                  <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                </div>

                {/* Step Number */}
                <span className="inline-block text-xs font-bold text-primary bg-sage-100 px-3 py-1 rounded-full mb-3">
                  STEP {step.step}
                </span>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
