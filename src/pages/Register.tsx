import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FamilyName {
  id: string;
  full_name: string;
}

const Register = () => {
  const [names, setNames] = useState<FamilyName[]>([]);
  const [namesLoading, setNamesLoading] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });

  const { signUp } = useAuth();
  const { toast } = useToast();

  // Only people who appear in the family tree can create an account.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any).rpc("signup_family_names");
      if (cancelled) return;
      setNames((data ?? []) as FamilyName[]);
      setNamesLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleNameSelect = (value: string) => {
    setMemberId(value);
    const chosen = names.find((n) => n.id === value);
    toast({
      title: "Make sure you have selected your name",
      description: chosen ? `You selected ${chosen.full_name}. Double-check it is really you.` : undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const chosen = names.find((n) => n.id === memberId);
    if (!chosen) {
      toast({ title: "Choose your name", description: "Select your name from the family tree.", variant: "destructive" });
      return;
    }
    if (!formData.email || !formData.password) {
      toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, chosen.full_name, chosen.id);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Registration failed",
        description: /already registered|already been registered|User already/i.test(error.message)
          ? "This email is already used by another family member. Each person needs their own email address."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    setConfirmSent(true);
  };

  const renderBody = () => {
    if (confirmSent) {
      return (
        <div className="text-center py-6">
          <MailCheck className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Confirm your email</h1>
          <p className="text-muted-foreground text-sm">
            We have sent a confirmation link to <strong>{formData.email}</strong>. Click it to verify
            your address, then sign in.
          </p>
          <Link to="/login" className="inline-block mt-6 text-primary hover:underline">Go to sign in</Link>
        </div>
      );
    }

    return (
      <>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground mb-6">
          Find your name in the family tree and set up your sign-in details.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Your name</Label>
            <Select value={memberId} onValueChange={handleNameSelect} disabled={isLoading || namesLoading}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={namesLoading ? "Loading family names..." : "Select your name"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {names.map((n) => (
                  <SelectItem key={n.id} value={n.id}>{n.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You can add your birthday, occupation and more after signing in.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email}
                onChange={handleChange} className="pl-11 h-12 bg-card border-sage-200 focus:border-primary"
                required disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters"
                value={formData.password} onChange={handleChange}
                className="pl-11 pr-11 h-12 bg-card border-sage-200 focus:border-primary" required disabled={isLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange}
                className="pl-11 h-12 bg-card border-sage-200 focus:border-primary" required disabled={isLoading} />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full mt-6" size="lg" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating account...</>)
              : (<>Create Account<ArrowRight className="w-5 h-5 ml-2" /></>)}
          </Button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </>
    );
  };


  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Link to="/" className="inline-block mb-8"><Logo size="md" /></Link>
          {renderBody()}
        </motion.div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sage-500 via-sage-600 to-accent items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 border-2 border-primary-foreground rounded-full" />
          <div className="absolute bottom-32 left-16 w-40 h-40 border border-primary-foreground rounded-full" />
          <div className="absolute top-1/3 right-1/3 w-56 h-56 border border-primary-foreground rounded-full" />
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }} className="text-center relative z-10 max-w-lg">
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-6">
            Build Your Family's Digital Home
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Preserve genealogy, share stories, and strengthen bonds that transcend time and distance.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {["Private family archive", "Story Preservation", "Services Directory", "MAGGIE AI Assistant"].map((feature, i) => (
              <motion.div key={feature} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-2 text-primary-foreground/90">
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
