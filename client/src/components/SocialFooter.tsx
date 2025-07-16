import { Instagram, Twitter } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export function SocialFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Social Media Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://www.instagram.com/contractclarity?igsh=YmVia283ZXNla3E2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Follow us on Instagram"
            >
              <Instagram size={20} />
            </a>
            
            <a
              href="https://x.com/contractcl?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Follow us on X (Twitter)"
            >
              <Twitter size={20} />
            </a>
            
            <a
              href="https://www.tiktok.com/@contractclarity?_t=ZN-8y4VLwDlCKs&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Follow us on TikTok"
            >
              <SiTiktok size={20} />
            </a>
          </div>
          
          {/* Legal Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="/privacy-policy" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Support
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Contract Clarity. All rights reserved.</p>
            <p className="mt-1">Follow us for legal tips and updates</p>
          </div>
        </div>
      </div>
    </footer>
  );
}