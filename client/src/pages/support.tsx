import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import { CheckCircle, Mail, MessageSquare, User } from "lucide-react";

const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  issue: z.string().min(10, "Please describe your issue in at least 10 characters"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function Support() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      issue: "",
    },
  });

  const submitSupportRequest = useMutation({
    mutationFn: async (data: SupportFormData) => {
      return apiRequest("/api/support", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Support request submitted",
        description: "We'll get back to you within 24 hours.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to submit request",
        description: error.message || "Please try again later.",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitSupportRequest.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Thank You!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Your support request has been submitted successfully. Our team will review your issue and get back to you within 24 hours.
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="mr-4"
            >
              Submit Another Request
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Having trouble with Contract Clarity? We're here to help. Submit your issue below and our support team will assist you promptly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Support Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Submit Support Request
                </CardTitle>
                <CardDescription>
                  Describe your issue and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your full name" 
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="your.email@example.com" 
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Issue Description
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce the problem, and any other relevant information..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12"
                      disabled={submitSupportRequest.isPending}
                    >
                      {submitSupportRequest.isPending ? "Submitting..." : "Submit Support Request"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Support Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      How long does contract analysis take?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Most contracts are analyzed within 30-60 seconds. Larger documents may take up to 2 minutes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      What file formats are supported?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      We support PDF, DOCX, and TXT files up to 10MB in size.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Is my contract data secure?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Yes, all contracts are encrypted and stored securely. We never share your data with third parties.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        support@contractclarity.co.uk
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Average response time: 2-4 hours
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Support hours: Monday-Friday, 9 AM - 6 PM GMT
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}