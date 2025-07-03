import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  steps?: string[];
}

export default function LoadingModal({ 
  isOpen, 
  title = "Processing...", 
  description = "Please wait while we process your request.",
  steps = []
}: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          {steps.length > 0 && (
            <div className="text-sm text-gray-500 space-y-1">
              {steps.map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
