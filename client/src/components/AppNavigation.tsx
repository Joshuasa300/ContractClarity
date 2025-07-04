import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Home, Upload, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function AppNavigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return null; // Don't show navigation on landing page
  }

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-text-primary">ContractAI</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={isActive("/") && location === "/" ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/upload">
              <Button 
                variant={isActive("/upload") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <Button 
                  variant={isActive("/") && location === "/" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/upload">
                <Button 
                  variant={isActive("/upload") ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Contract</span>
                </Button>
              </Link>

              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 px-3 py-2">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="flex items-center space-x-2 justify-start"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}