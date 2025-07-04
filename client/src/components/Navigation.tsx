import { FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavigationProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  onSignUp?: () => void;
}

export default function Navigation({ onSignIn, onGetStarted, onSignUp }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-text-primary">ContractAI</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-text-primary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#" className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                About
              </a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={onSignIn}>
              Sign In
            </Button>
            <Button variant="outline" onClick={onSignUp || onSignIn}>
              Sign Up
            </Button>
            <Button onClick={onGetStarted}>
              Get Started
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 text-base font-medium text-text-primary hover:text-primary">
              Home
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-primary">
              Features
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-primary">
              Pricing
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-primary">
              About
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start" onClick={onSignIn}>
                Sign In
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={onSignUp || onSignIn}>
                Sign Up
              </Button>
              <Button className="w-full justify-start" onClick={onGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
