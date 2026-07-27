import { motion } from "framer-motion";
import { ArrowRight, Users, BookOpen, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-tree.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Family heritage tree"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-sage-900/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline / Motto */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sage-700 font-display italic text-base md:text-xl mb-6 leading-relaxed"
          >
            "Sethare se segologolo, Sethare se setona,
            <br className="hidden sm:block" />
            {" "}Sethare Moriti o tsidididi, Sethare se maungo a monate…"
          </motion.p>


          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Your Family's{" "}
            <span className="text-primary">Living Legacy</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body"
          >
            A digital home for your extended family. Preserve genealogy, share stories, 
            connect generations, and strengthen bonds that transcend time and distance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Start Your Family Circle
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/demo">
                Explore Demo
              </Link>
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Users, label: "Family Trees" },
              { icon: BookOpen, label: "Shared Stories" },
              { icon: Heart, label: "Generational Bonds" },
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-sage-200 shadow-card"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
