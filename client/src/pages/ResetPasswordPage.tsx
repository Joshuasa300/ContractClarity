import { useRoute, useLocation } from 'wouter';
import { useEffect } from 'react';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [match, params] = useRoute('/reset-password/:token');
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    // Redirect to login page with success message
    setLocation('/login?reset=success');
  };

  const handleInvalidToken = () => {
    // Show invalid token page
    setLocation('/reset-password/invalid');
  };

  // If no token is provided, redirect to forgot password page
  useEffect(() => {
    if (!match || !params?.token) {
      setLocation('/forgot-password');
    }
  }, [match, params, setLocation]);

  if (!match || !params?.token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <ResetPasswordForm 
        token={params.token} 
        onSuccess={handleSuccess}
        onInvalidToken={handleInvalidToken}
      />
    </div>
  );
}

// Invalid token page component
export function InvalidTokenPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-red-600">Reset Link Expired</CardTitle>
            <CardDescription>
              This password reset link has expired or is no longer valid. 
              Password reset links are only valid for 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setLocation('/forgot-password')}
              className="w-full"
            >
              Request New Reset Link
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Success page component
export function ResetSuccessPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-green-600">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully reset. 
              You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation('/login')}
              className="w-full"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}