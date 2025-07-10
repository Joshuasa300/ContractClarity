import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface PageLimitExample {
  name: string;
  chars: number;
  textTokens: number;
  totalTokens: number;
  estimatedPages: number;
  planResults: Array<{
    plan: string;
    allowed: boolean;
    maxPages: number;
  }>;
}

interface PageLimitData {
  currentPlan: string;
  currentLimit: number;
  currentMaxPages: number;
  examples: PageLimitExample[];
  explanation: {
    tokenCalculation: string;
    pageCalculation: string;
    planLimits: Array<{
      plan: string;
      tokenLimit: number;
      pageLimit: number;
    }>;
  };
}

export default function PageLimitsDemo() {
  const { data, isLoading } = useQuery<PageLimitData>({
    queryKey: ["/api/demo/page-limits"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const planColors = {
    free: "bg-gray-100 text-gray-800",
    plus: "bg-blue-100 text-blue-800",
    pro: "bg-purple-100 text-purple-800",
    premium: "bg-gold-100 text-gold-800"
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Page Limits Explanation</h1>
        <p className="text-gray-600">Understanding how document size limits work across plans</p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge className={planColors[data.currentPlan as keyof typeof planColors] || "bg-gray-100"}>
              {data.currentPlan.charAt(0).toUpperCase() + data.currentPlan.slice(1)} Plan
            </Badge>
            <div className="text-sm text-gray-600">
              Token Limit: {data.currentLimit.toLocaleString()} | Max Pages: {data.currentMaxPages}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How Page Limits Are Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-mono text-sm">
              <div>{data.explanation.tokenCalculation}</div>
              <div>{data.explanation.pageCalculation}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.explanation.planLimits.map((plan) => (
              <div key={plan.plan} className="text-center p-3 border rounded-lg">
                <div className="font-semibold capitalize">{plan.plan}</div>
                <div className="text-sm text-gray-600">{plan.tokenLimit.toLocaleString()} tokens</div>
                <div className="text-lg font-bold text-blue-600">{plan.pageLimit} pages</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-World Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.examples.map((example, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{example.name}</h3>
                  <Badge variant="outline">{example.estimatedPages} pages</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Characters:</span> {example.chars.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Text Tokens:</span> {example.textTokens.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Total Tokens:</span> {example.totalTokens.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {example.planResults.map((result) => (
                    <div 
                      key={result.plan}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        result.allowed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {result.allowed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <div className="text-sm">
                        <div className="font-medium capitalize">{result.plan}</div>
                        <div className="text-xs text-gray-600">
                          Max: {result.maxPages}p
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Token-Based:</strong> Limits are based on processing cost, not just page count</li>
            <li>• <strong>Fair Usage:</strong> Large documents consume appropriate resources</li>
            <li>• <strong>Overhead Included:</strong> System prompts and responses are factored in</li>
            <li>• <strong>Dual Limits:</strong> Both document size AND monthly count limits apply</li>
            <li>• <strong>Pre-Validation:</strong> Documents are checked before processing to prevent waste</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}