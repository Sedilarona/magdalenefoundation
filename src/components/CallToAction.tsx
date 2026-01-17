import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const CallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-600 via-sage-700 to-accent" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Begin Your Family's Journey Today
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 leading-relaxed">
            Join thousands of families who are preserving their heritage, strengthening bonds, 
            and creating a living legacy for generations to come.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero-outline" 
              size="xl" 
              asChild
              className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Link to="/register">
                Start Your Family Circle
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="xl" 
              asChild
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            Free to start • No credit card required • Family-first pricing
          </p>
        </motion.div>
      </div>
    </section>
  );
};
