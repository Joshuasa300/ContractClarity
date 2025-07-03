import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Key,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import type { Contract } from "@shared/schema";

interface AnalysisResultsProps {
  contract: Contract;
}

export default function AnalysisResults({ contract }: AnalysisResultsProps) {
  const riskAssessment = contract.riskAssessment as any;
  const keyTerms = contract.keyTerms as any[];
  const recommendations = contract.recommendations as any[];

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variant = priority === 'high' ? 'destructive' : 
                   priority === 'medium' ? 'secondary' : 'outline';
    return (
      <Badge variant={variant} className="text-xs">
        {priority} priority
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Contract Analysis Results
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered insights from your contract
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              Plain Language Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {contract.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 text-yellow-500 mr-2" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAssessment?.high?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">High Risk</h4>
                  {riskAssessment.high.map((risk: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-red-700">{risk.title}</p>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {riskAssessment?.medium?.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">Medium Risk</h4>
                  {riskAssessment.medium.map((risk: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-yellow-700">{risk.title}</p>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {riskAssessment?.low?.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2">Low Risk</h4>
                  {riskAssessment.low.map((risk: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-green-700">{risk.title}</p>
                        <p className="text-sm text-gray-600">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 text-secondary mr-2" />
              Key Terms & Clauses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyTerms?.map((term: any, index: number) => (
                <div key={index} className={`border-l-4 ${getRiskColor(term.riskLevel)} pl-4`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-primary">{term.title}</h4>
                    <div className="flex items-center space-x-1">
                      {getRiskIcon(term.riskLevel)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{term.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {term.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-accent mr-2" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations?.map((recommendation: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-700 flex-1 mr-2">
                        {recommendation.action}
                      </p>
                      {getPriorityBadge(recommendation.priority)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
