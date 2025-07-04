import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Contract } from "@shared/schema";

interface AnalysisProgressProps {
  contractId: number;
  onComplete?: (contract: Contract) => void;
}

export default function AnalysisProgress({ contractId, onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Use the contracts list query to find our specific contract
  const { data: contracts, isLoading, isError } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
    refetchInterval: isComplete ? false : 2000, // Poll every 2 seconds until complete
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Find the specific contract from the list
  const contract = contracts?.find(c => c.id === contractId);

  // Helper function to check if analysis is complete
  const isAnalysisComplete = (value: any): boolean => {
    return value === true || value === 't' || value === 'true' || value === 1;
  };

  useEffect(() => {
    if (contract) {
      const complete = isAnalysisComplete(contract.analysisComplete);
      
      if (complete && !isComplete) {
        // Analysis just completed
        setProgress(100);
        setIsComplete(true);
        if (onComplete) {
          onComplete(contract);
        }
      } else if (!complete) {
        // Still processing - simulate progress
        setProgress(prev => {
          if (prev >= 90) return prev; // Cap at 90% until actually complete
          return Math.min(prev + Math.random() * 10, 90);
        });
      }
    }
  }, [contract, isComplete, onComplete]);

  // Initialize progress when component mounts
  useEffect(() => {
    const initialProgress = setInterval(() => {
      setProgress(prev => {
        if (prev >= 60) {
          clearInterval(initialProgress);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    return () => clearInterval(initialProgress);
  }, []);

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">
            Failed to track analysis progress
          </span>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              Analysis Complete!
            </span>
          </div>
          <span className="text-sm text-green-600">100%</span>
        </div>
        <Progress value={100} className="w-full mt-2" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
          <span className="text-sm text-blue-700 font-medium">
            Analyzing Contract...
          </span>
        </div>
        <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-xs text-blue-600 mt-2">
        Our AI is reading your contract and preparing detailed analysis
      </p>
    </div>
  );
}