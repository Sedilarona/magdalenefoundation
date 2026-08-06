import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, GitBranch } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FAMILY_BRANCHES = [
  "Teko Mazile (branch)",
  "Mmasane Bodilenyane (branch)",
  "Onkgopotse Boy Bodilenyane (branch)",
  "Sechele Bodilenyane (branch)",
  "Masego Bodilenyane (branch)",
  "Thuso Bodilenyane (branch)",
  "Letsogile 'Stanley' Bodilenyane (branch)",
  "Stanley Poane (branch)",
  "Magdeline Bodilenyane (branch)",
  "Other / Extended family",
];

interface FamilyName {
  full_name: string;
  gender: string | null;
  birth_year: string | null;
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    familyBranch: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [names, setNames] = useState<FamilyName[]>([]);
  const [namesLoading, setNamesLoading] = useState(true);

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Only people already recorded in the family tree may open an account.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc("list_family_names");
      if (cancelled) return;
      const rows = ((data ?? []) as unknown as FamilyName[])
        .filter((r) => r.full_name)
        .sort((a, b) => a.full_name.localeCompare(b.full_name));
      setNames(rows);
      setNamesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMember = names.find((n) => n.full_name === formData.fullName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password || !formData.familyBranch) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields including your family branch.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName);

    if (!error) {
      // Persist branch selection onto the profile once it exists
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({ family_branch: formData.familyBranch }).eq("user_id", user.id);
        }
      } catch (_) {}
    }

    setIsLoading(false);

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message.includes("already registered")
          ? "This email is already registered. Please sign in instead."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome to the family!", description: "Your account has been created successfully." });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-block mb-8">
            <Logo size="md" />
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground mb-6">
            Join the Magdalene Foundation and connect with your family.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-card border-sage-200 focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyBranch" className="text-foreground">Family Branch</Label>
              <Select
                value={formData.familyBranch}
                onValueChange={(v) => setFormData((p) => ({ ...p, familyBranch: v }))}
                disabled={isLoading}
              >
                <SelectTrigger id="familyBranch" className="h-12 bg-card border-sage-200">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select the branch you belong to" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {FAMILY_BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Registration is limited to Magdalene family members and descendants.</p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-card border-sage-200 focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11 h-12 bg-card border-sage-200 focus:border-primary"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-card border-sage-200 focus:border-primary"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full mt-6" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4 text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sage-500 via-sage-600 to-accent items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 border-2 border-primary-foreground rounded-full" />
          <div className="absolute bottom-32 left-16 w-40 h-40 border border-primary-foreground rounded-full" />
          <div className="absolute top-1/3 right-1/3 w-56 h-56 border border-primary-foreground rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center relative z-10 max-w-lg"
        >
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-6">
            Build Your Family's Digital Home
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Preserve genealogy, share stories, and strengthen bonds that transcend 
            time and distance.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              "Interactive Family Trees",
              "Story Preservation",
              "Services Directory",
              "MAGGIE AI Assistant",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 text-primary-foreground/90"
              >
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
