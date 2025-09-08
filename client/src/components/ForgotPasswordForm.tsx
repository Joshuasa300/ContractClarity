import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const startCooldown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });

      const result = await response.json();

      if (response.status === 429) {
        toast({
          title: 'Rate Limited',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      if (response.ok) {
        setIsSuccess(true);
        startCooldown();
        toast({
          title: 'Reset Link Sent',
          description: 'If an account with that email exists, a password reset link has been sent.',
        });
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to send reset email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-700">
                  If an account with that email exists, a password reset link has been sent.
                  Please check your email and follow the instructions.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder.
                </div>
                
                {countdown > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>You can request another email in {countdown} seconds</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccess(false);
                      form.reset();
                    }}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Another Email
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={onBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading ? (
                      'Sending Reset Link...'
                    ) : countdown > 0 ? (
                      `Wait ${countdown}s`
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBackToLogin}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}