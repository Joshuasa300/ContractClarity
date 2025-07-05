import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Plus, 
  Settings, 
  Filter,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useLocation } from "wouter";
import type { ContractTemplate, TemplateVariable } from "@shared/schema";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/i18n";
import { useContentTranslation } from "../hooks/useContentTranslation";

export default function Templates() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { translateArray, language } = useContentTranslation();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [translatedTemplates, setTranslatedTemplates] = useState<ContractTemplate[]>([]);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation("/");
    return null;
  }

  const { data: templates = [], isLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/templates"],
    retry: false,
  });

  // Translate templates when language changes
  useEffect(() => {
    if (templates.length > 0) {
      translateArray(templates, ['name', 'description'], 'contract template metadata')
        .then(setTranslatedTemplates)
        .catch(() => setTranslatedTemplates(templates));
    }
  }, [templates, language, translateArray]);

  const createContractMutation = useMutation({
    mutationFn: async (data: { templateId: number; variables: Record<string, string>; fileName: string }) => {
      console.log("Client: Sending contract creation request", data);
      const response = await apiRequest("POST", "/api/contracts/from-template", data);
      const result = await response.json();
      console.log("Client: Received response", result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contract Created",
        description: "Your contract has been created successfully and is ready for review.",
      });
      setSelectedTemplate(null);
      setTemplateVariables({});
      setFileName("");
      // Navigate to contracts page
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create contract",
        variant: "destructive",
      });
    },
  });

  const categories = ["all", ...Array.from(new Set(templates.map(t => t.category)))];
  const currentTemplates = translatedTemplates.length > 0 ? translatedTemplates : templates;
  const filteredTemplates = selectedCategory === "all" 
    ? currentTemplates 
    : currentTemplates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setFileName(`${template.name} - ${new Date().toLocaleDateString()}`);

    // Initialize variables
    const variables = template.variables as TemplateVariable[] || [];
    const initialVariables: Record<string, string> = {};
    variables.forEach(variable => {
      initialVariables[variable.name] = "";
    });
    setTemplateVariables(initialVariables);
  };

  const handleCreateContract = () => {
    console.log("handleCreateContract called", { selectedTemplate: !!selectedTemplate, fileName, templateVariables });
    
    if (!selectedTemplate || !fileName.trim()) {
      console.log("Validation failed: missing template or filename", { hasTemplate: !!selectedTemplate, fileName: fileName.trim() });
      return;
    }

    // Validate required fields
    const variables = selectedTemplate.variables as TemplateVariable[] || [];
    console.log("Template variables:", variables);
    
    const missingRequired = variables
      .filter(variable => variable.required && !templateVariables[variable.name]?.trim())
      .map(variable => variable.label);

    console.log("Missing required fields:", missingRequired);

    if (missingRequired.length > 0) {
      toast({
        title: t('templates.validationError'),
        description: `${t('templates.requiredFields')}: ${missingRequired.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    console.log("All validations passed, creating contract...");

    createContractMutation.mutate({
      templateId: selectedTemplate.id,
      variables: templateVariables,
      fileName: fileName.trim(),
    });
  };

  const renderVariableInput = (variable: TemplateVariable) => {
    const value = templateVariables[variable.name] || "";

    switch (variable.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => 
              setTemplateVariables(prev => ({ ...prev, [variable.name]: newValue }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${variable.label}`} />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => 
              setTemplateVariables(prev => ({ ...prev, [variable.name]: e.target.value }))
            }
            placeholder={variable.placeholder}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => 
              setTemplateVariables(prev => ({ ...prev, [variable.name]: e.target.value }))
            }
            placeholder={variable.placeholder}
          />
        );
      default:
        return variable.name === 'services' || variable.name === 'purpose' ? (
          <Textarea
            value={value}
            onChange={(e) => 
              setTemplateVariables(prev => ({ ...prev, [variable.name]: e.target.value }))
            }
            placeholder={variable.placeholder}
            rows={3}
          />
        ) : (
          <Input
            type="text"
            value={value}
            onChange={(e) => 
              setTemplateVariables(prev => ({ ...prev, [variable.name]: e.target.value }))
            }
            placeholder={variable.placeholder}
          />
        );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbs = [
    { label: t('nav.home'), href: "/" },
    { label: t('templates.title') }
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header breadcrumbs={breadcrumbs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('templates.title')}</h1>
        <p className="text-gray-600">
          {t('templates.description')}
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? t('templates.allCategories') : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => handleTemplateSelect(template)}
                  >
{t('templates.useTemplate')} <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Contract: {selectedTemplate?.name}</DialogTitle>
                  </DialogHeader>

                  {selectedTemplate && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="fileName">{t('templates.fileName')}</Label>
                        <Input
                          id="fileName"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="Enter contract name"
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t('templates.fillDetails')}</h3>
                        {(selectedTemplate.variables as TemplateVariable[] || []).map((variable) => (
                          <div key={variable.name}>
                            <Label htmlFor={variable.name}>
                              {variable.label}
                              {variable.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderVariableInput(variable)}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end space-x-3">
                        <DialogTrigger asChild>
                          <Button variant="outline">{t('common.cancel')}</Button>
                        </DialogTrigger>
                        <Button 
                          onClick={handleCreateContract}
                          disabled={createContractMutation.isPending || !fileName.trim() || !selectedTemplate}
                        >
                          {createContractMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
{t('common.loading')}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
{t('templates.createContract')}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Templates Found</h3>
          <p className="text-gray-500">
            {selectedCategory === "all" 
              ? "No templates are available yet." 
              : `No templates found in the ${selectedCategory} category.`
            }
          </p>
        </div>
      )}
    </div>
    </div>
  );
}