import { motion } from "framer-motion";
import { Sparkles, MessageCircle, Search, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const maggieFeatures = [
  {
    icon: Search,
    query: "How am I related to Uncle John?",
    response: "Uncle John is your father's older brother. He married Aunt Sarah in 1985, making her your aunt by marriage.",
  },
  {
    icon: MessageCircle,
    query: "Find all my cousins in Johannesburg",
    response: "I found 4 cousins in Johannesburg: Thabo, Lerato, Mpho, and Kagiso. Would you like their contact details?",
  },
  {
    icon: Heart,
    query: "Tell me about grandmother's childhood",
    response: "Your grandmother, Magdalene, grew up in Molepolole. I found 3 stories and 12 photos from that era.",
  },
];

export const MaggiePreview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-sage-50/50 to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-sage-100 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Meet <span className="text-primary">MAGGIE</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-4 font-display italic">
              Matriarchal Archive of Generational Genealogy & Insight Engine
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your digital family matriarch. MAGGIE understands your family's unique story, 
              helps you discover connections, and proactively reminds you of important moments. 
              She's wise, respectful, and always here to help.
            </p>

            <Button variant="hero" size="lg" asChild>
              <Link to="/register">
                Experience MAGGIE
              </Link>
            </Button>
          </motion.div>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-2xl shadow-elevated border border-sage-100 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-sage-500 to-sage-600 px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-primary-foreground">MAGGIE</h4>
                  <p className="text-xs text-primary-foreground/70">Your Family AI</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4">
                {maggieFeatures.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
                    className="space-y-3"
                  >
                    {/* User Query */}
                    <div className="flex justify-end">
                      <div className="bg-sage-100 rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-foreground">{item.query}</p>
                      </div>
                    </div>
                    
                    {/* MAGGIE Response */}
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <item.icon className="w-3 h-3 text-primary" />
                      </div>
                      <div className="bg-earth-50 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                        <p className="text-sm text-foreground">{item.response}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-sage-200/50 rounded-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
