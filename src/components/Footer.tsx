import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Heart } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
      { label: "Security", href: "/security" },
    ],
    resources: [
      { label: "User Guide", href: "/guide" },
      { label: "FAQs", href: "/faqs" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-sage-900 text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="lg" className="mb-4 text-primary-foreground" />
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Preserving family heritage, connecting generations, and strengthening bonds 
              through technology with heart.
            </p>
            <p className="font-display italic text-primary-foreground/50 text-sm">
              Sethare se segologolo, Sethare sa maungo a monate, Sethare se moriti o tsididi
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/50">
              © {currentYear} Magdalene Foundation. All rights reserved.
            </p>
            <p className="text-sm text-primary-foreground/50 flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-sage-400" /> for families everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
