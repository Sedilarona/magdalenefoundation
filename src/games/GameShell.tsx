import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface GameShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

export const GameShell = ({ title, subtitle, children, headerAction }: GameShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/games"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to games"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 lg:p-8"
      >
        {children}
      </motion.main>
    </div>
  );
};
