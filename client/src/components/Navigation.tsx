import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { LanguageSelector } from "./LanguageSelector";
import { Logo } from "./ui/logo";

interface NavigationProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export default function Navigation({ onSignIn, onGetStarted, onSignUp }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <Logo size="lg" showText={true} className="group-hover:scale-105 transition-transform duration-200" />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                About
              </Link>
              <Link href="/support" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Support
              </Link>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <Button
                  variant="ghost"
                  onClick={onSignIn}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Sign In
                </Button>
                <Button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Mobile menu panel */}
          <div className="fixed top-14 sm:top-16 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl shadow-2xl border-b border-gray-200/30 dark:border-gray-700/30 z-50 md:hidden">
            <div className="px-3 py-4 space-y-1">
              {[
                { href: "/features", label: "Features" },
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/support", label: "Support" }
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 active:scale-95"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="pt-4 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSignIn();
                  }}
                  className="w-full justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 h-11 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onGetStarted();
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl h-11 rounded-lg transition-all duration-200 active:scale-95"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}