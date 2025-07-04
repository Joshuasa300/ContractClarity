import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Copy, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  Loader2,
  Library
} from "lucide-react";
import { useLocation } from "wouter";
import type { ClauseLibraryItem } from "@shared/schema";

export default function Clauses() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClause, setSelectedClause] = useState<ClauseLibraryItem | null>(null);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: clauses = [], isLoading } = useQuery<ClauseLibraryItem[]>({
    queryKey: ["/api/clauses", { search: searchQuery || undefined, category: selectedCategory !== "all" ? selectedCategory : undefined }],
    retry: false,
  });

  const categories = ["all", ...new Set(clauses.map(c => c.category))];
  
  const getRiskLevelIcon = (level: string | null) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (level: string | null) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Clause Library</h1>
        <p className="text-gray-600">
          Browse and copy standardized contract clauses for your agreements
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clauses by title, description, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clauses.map((clause) => (
          <Card key={clause.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getRiskLevelIcon(clause.riskLevel)}
                  <Badge variant="secondary">{clause.category}</Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={getRiskLevelColor(clause.riskLevel)}
                >
                  {clause.riskLevel || 'Unknown'} Risk
                </Badge>
              </div>
              <CardTitle className="text-lg">{clause.title}</CardTitle>
              <p className="text-sm text-gray-600">{clause.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clause.tags && clause.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {clause.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedClause(clause)}
                      >
                        View Full Text
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {getRiskLevelIcon(selectedClause?.riskLevel)}
                          <span>{selectedClause?.title}</span>
                        </DialogTitle>
                      </DialogHeader>
                      
                      {selectedClause && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{selectedClause.category}</Badge>
                            <Badge 
                              variant="outline" 
                              className={getRiskLevelColor(selectedClause.riskLevel)}
                            >
                              {selectedClause.riskLevel || 'Unknown'} Risk
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600">{selectedClause.description}</p>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">Clause Text</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(selectedClause.content)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                            <p className="text-sm whitespace-pre-wrap font-mono">
                              {selectedClause.content}
                            </p>
                          </div>
                          
                          {selectedClause.tags && selectedClause.tags.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {selectedClause.tags.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(clause.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clauses.length === 0 && (
        <div className="text-center py-12">
          <Library className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Clauses Found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No clauses match your search "${searchQuery}".`
              : selectedCategory === "all" 
                ? "No clauses are available yet." 
                : `No clauses found in the ${selectedCategory} category.`
            }
          </p>
        </div>
      )}
    </div>
  );
}