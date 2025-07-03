import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CloudUpload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { useLocation } from "wouter";

export default function ContractUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("contract", file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest("POST", "/api/contracts", formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Upload Successful",
        description: "Your contract has been uploaded and analysis is starting.",
      });
      setUploadProgress(0);
      // Navigate to analysis page
      setLocation(`/analysis/${data.contractId}`);
    },
    onError: (error) => {
      setUploadProgress(0);
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
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload contract",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Upload Your Contract
          </h2>
          <p className="text-gray-600">
            Upload your contract and get instant AI analysis
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          <div className="max-w-sm mx-auto">
            <CloudUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragActive ? "Drop your contract here" : "Upload Contract"}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your contract here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF and TXT files (Max 10MB)
            </p>
            <Button 
              type="button" 
              variant="outline"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Choose File"
              )}
            </Button>
          </div>
        </div>

        {uploadMutation.isPending && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {uploadMutation.isError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">
                {uploadMutation.error instanceof Error 
                  ? uploadMutation.error.message 
                  : "Upload failed"}
              </span>
            </div>
          </div>
        )}

        {uploadMutation.isSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-700">
                Contract uploaded successfully! Analysis is starting...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
