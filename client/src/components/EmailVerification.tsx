import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, Clock, AlertCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onResendCode: () => void;
}

export default function EmailVerification({ 
  email, 
  onVerificationSuccess, 
  onResendCode 
}: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // If auto-login successful, redirect immediately
        if (data.autoLogin) {
          window.location.href = '/dashboard';
        } else {
          setTimeout(() => {
            onVerificationSuccess();
          }, 1500);
        }
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCanResend(false);
        setCountdown(60);
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        onResendCode();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">Email Verified!</CardTitle>
          <CardDescription>
            Your email address has been successfully verified. You can now access your account.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification code to <strong>{email}</strong>. 
          Please enter the 6-digit code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={6}
            className="text-center text-lg font-mono tracking-widest"
            disabled={isVerifying}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || !verificationCode.trim()}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify Email'}
        </Button>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Didn't receive the code?</p>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={isResending || !canResend}
            className="p-0 h-auto text-sm"
          >
            {isResending ? (
              'Sending...'
            ) : canResend ? (
              'Resend Code'
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Resend in {countdown}s
              </span>
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>The verification code expires in 24 hours.</p>
        </div>
      </CardContent>
    </Card>
  );
}