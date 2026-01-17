import { motion } from "framer-motion";
import { 
  GitBranch, 
  BookHeart, 
  Users, 
  Sparkles, 
  Library, 
  Gamepad2,
  Utensils,
  MapPin
} from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Interactive Family Tree",
    description: "Visualize your lineage with beautiful, interactive trees. Connect generations, trace relationships, and preserve your heritage.",
  },
  {
    icon: BookHeart,
    title: "Our Tales",
    description: "Record and share family stories through text, audio, and video. Preserve memories with guided interview prompts for elders.",
  },
  {
    icon: Users,
    title: "Services Directory",
    description: "Discover skills and services within your family. Find the plumber, teacher, or chef you never knew you had.",
  },
  {
    icon: Sparkles,
    title: "MAGGIE AI Assistant",
    description: "Your digital matriarch. Ask about relationships, find connections, and let MAGGIE help preserve family knowledge.",
  },
  {
    icon: Library,
    title: "Family Library",
    description: "Centralize photos, documents, and videos. Organized by events, people, and historical significance.",
  },
  {
    icon: Gamepad2,
    title: "Family Tricks",
    description: "Fun games and challenges that strengthen bonds. Match faces to names, test family knowledge, earn badges.",
  },
  {
    icon: Utensils,
    title: "Recipe Collection",
    description: "Preserve grandmother's secret recipes. Share traditional dishes across generations with step-by-step guides.",
  },
  {
    icon: MapPin,
    title: "Family Location",
    description: "See where family members are. Coordinate visits, connect with nearby relatives, and stay in touch.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-sage-50/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything Your Family Needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with love for families of all sizes. From preserving memories to strengthening connections.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl p-6 shadow-card border border-sage-100 hover:shadow-elevated hover:border-sage-200 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
