import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Users, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    familyCode: "",
    password: "",
    confirmPassword: "",
  });
  const [registrationType, setRegistrationType] = useState<"join" | "create">("join");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration attempt:", formData);
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
            Join Your Family
          </h1>
          <p className="text-muted-foreground mb-6">
            Create an account to connect with your family circle.
          </p>

          {/* Registration Type Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-sage-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRegistrationType("join")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                registrationType === "join"
                  ? "bg-card shadow-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Join Existing Circle
            </button>
            <button
              type="button"
              onClick={() => setRegistrationType("create")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                registrationType === "create"
                  ? "bg-card shadow-card text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              Create New Circle
            </button>
          </div>

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
                />
              </div>
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
                />
              </div>
            </div>

            {registrationType === "join" && (
              <div className="space-y-2">
                <Label htmlFor="familyCode" className="text-foreground">
                  Family Invitation Code
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="familyCode"
                    type="text"
                    placeholder="Enter your invitation code"
                    value={formData.familyCode}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-card border-sage-200 focus:border-primary"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask a family Superuser for your invitation code
                </p>
              </div>
            )}

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
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full mt-6" size="lg">
              {registrationType === "join" ? "Join Family Circle" : "Create Family Circle"}
              <ArrowRight className="w-5 h-5 ml-2" />
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
