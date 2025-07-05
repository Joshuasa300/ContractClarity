
import { useState } from "react";
import { Plus, Upload, FileText, Library, Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const actions = [
    {
      icon: Upload,
      label: t('dashboard.uploadContract'),
      action: () => {
        // Scroll to upload section or trigger upload modal
        const uploadSection = document.querySelector('[data-upload-section]');
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
      },
      color: "bg-primary hover:bg-primary/90"
    },
    {
      icon: FileText,
      label: t('nav.templates'),
      href: "/templates",
      color: "bg-secondary hover:bg-secondary/90"
    },

    {
      icon: Languages,
      label: t('language.title'),
      href: "/translation-helper",
      color: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-40">
        {/* Action Buttons */}
        <div className={`flex flex-col space-y-3 mb-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          {actions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {action.href ? (
                  <Link href={action.href}>
                    <Button
                      size="sm"
                      className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 w-12 rounded-full p-0`}
                      onClick={() => setIsOpen(false)}
                    >
                      <action.icon className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 w-12 rounded-full p-0`}
                    onClick={() => {
                      action.action?.();
                      setIsOpen(false);
                    }}
                  >
                    <action.icon className="h-5 w-5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Main Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={`bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 rounded-full p-0 ${
                isOpen ? 'rotate-45' : 'rotate-0'
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? t('common.close') : t('dashboard.quickActions')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
