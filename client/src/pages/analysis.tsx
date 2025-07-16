import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Plus, 
  AlertTriangle, 
  Shield, 
  Clock,
  Key,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import AnalysisResults from "@/components/AnalysisResults";
import type { Contract } from "@shared/schema";

export default function Analysis() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, params] = useRoute("/analysis/:contractId");
  const contractId = params?.contractId;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch contract details
  const { data: contract, isLoading: contractLoading, error } = useQuery({
    queryKey: ["/api/contracts", contractId],
    enabled: isAuthenticated && !!contractId,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const handleDownloadReport = () => {
    if (!contract) return;
    
    const reportData = {
      contractName: contract.fileName,
      analysisDate: new Date().toLocaleDateString(),
      summary: contract.summary,
      riskAssessment: contract.riskAssessment,
      keyTerms: contract.keyTerms,
      recommendations: contract.recommendations,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.fileName}_analysis_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadContract = () => {
    if (!contract) return;
    
    const blob = new Blob([contract.fileContent], { 
      type: 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || contractLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Error Loading Contract
            </h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : "Failed to load contract"}
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Contract Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The contract you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-primary mr-2" />
                <div>
                  <h1 className="font-semibold text-text-primary">
                    {contract.fileName}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Analyzed on {new Date(contract.updatedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {contract.templateId ? (
                <Button variant="outline" size="sm" onClick={handleDownloadContract}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Contract
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
              <Link href="/">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Analyze Another
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!contract.analysisComplete ? (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                Analysis in Progress
              </h2>
              <p className="text-gray-600 mb-4">
                Your contract is being analyzed by our AI. This usually takes a few minutes.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>⚡ Processing document structure</p>
                <p>🔍 Identifying key terms</p>
                <p>⚠️ Assessing potential risks</p>
                <p>📝 Generating plain language summary</p>
              </div>
            </CardContent>
          </Card>
        ) : contract.templateId ? (
          // Show contract content for template-generated contracts
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {contract.fileName}
              </h1>
              <p className="text-xl text-gray-600">
                Generated Contract Document
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  Contract Content
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadContract}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Contract
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-gray-800">
                      {contract.fileContent}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AnalysisResults contract={contract} />
        )}
      </div>
    </div>
  );
}
