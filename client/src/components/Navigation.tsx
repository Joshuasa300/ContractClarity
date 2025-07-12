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
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200/20 dark:border-gray-700/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link href="/features" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              About
            </Link>
            <div className="pt-4 pb-2 space-y-2">
              <Button
                variant="ghost"
                onClick={onSignIn}
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Sign In
              </Button>
              <Button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}