import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FamilyTree from "./pages/FamilyTree";
import Tales from "./pages/Tales";
import Games from "./pages/Games";
import Resources from "./pages/Resources";
import Library from "./pages/Library";
import Maggie from "./pages/Maggie";
import LocateFamily from "./pages/LocateFamily";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import Crossword from "./games/Crossword";
import BibleTrivia from "./games/BibleTrivia";
import FamilyTrivia from "./games/FamilyTrivia";
import Ludo from "./games/Ludo";
import SnakesLadders from "./games/SnakesLadders";
import Chess from "./games/Chess";
import Crazy8 from "./games/Crazy8";
import Rummy from "./games/Rummy";
import FamilyPuzzle from "./games/FamilyPuzzle";
import WordSearch from "./games/WordSearch";
import MemoryMatch from "./games/MemoryMatch";
import TicTacToe from "./games/TicTacToe";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>

        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/family-tree" element={<FamilyTree />} />
            <Route path="/tales" element={<Tales />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/leaderboard" element={<Leaderboard />} />
            <Route path="/games/crossword" element={<Crossword />} />
            <Route path="/games/bible-trivia" element={<BibleTrivia />} />
            <Route path="/games/family-trivia" element={<FamilyTrivia />} />
            <Route path="/games/ludo" element={<Ludo />} />
            <Route path="/games/snakes-ladders" element={<SnakesLadders />} />
            <Route path="/games/chess" element={<Chess />} />
            <Route path="/games/crazy-8" element={<Crazy8 />} />
            <Route path="/games/rummy" element={<Rummy />} />
            <Route path="/games/family-puzzle" element={<FamilyPuzzle />} />
            <Route path="/games/word-search" element={<WordSearch />} />
            <Route path="/games/memory-match" element={<MemoryMatch />} />
            <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/library" element={<Library />} />
            <Route path="/maggie" element={<Maggie />} />
            <Route path="/locate-family" element={<LocateFamily />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>

);

export default App;
