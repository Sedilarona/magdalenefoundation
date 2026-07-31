import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  /** Step-by-step instructions shown in the "How to play" dialog. */
  howToPlay?: string[];
  /** Points earned so far this session, shown as a badge. */
  points?: number;
}

export const GameShell = ({
  title,
  subtitle,
  children,
  headerAction,
  howToPlay,
  points,
}: GameShellProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/games"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to games"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {typeof points === "number" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5" /> {points} pts
              </span>
            )}
            {howToPlay && howToPlay.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">How to play</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">How to play {title}</DialogTitle>
                    <DialogDescription>
                      A quick guide before you start.
                    </DialogDescription>
                  </DialogHeader>
                  <ol className="space-y-3 text-sm text-foreground list-decimal pl-5">
                    {howToPlay.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Points you earn are added to the family leaderboard.
                  </p>
                </DialogContent>
              </Dialog>
            )}
            {headerAction}
          </div>
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
