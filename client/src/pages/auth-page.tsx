import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import RegistrationForm from '@/components/RegistrationForm';
import EmailVerification from '@/components/EmailVerification';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'verify';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  
  // Check URL params for initial mode
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationUserId, setVerificationUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSuccess = () => {
    window.location.href = '/dashboard';
  };

  const handleRegistrationSuccess = (email: string) => {
    setVerificationEmail(email);
    setMode('verify');
    setSuccessMessage('Registration initiated! Please check your email for a 6-digit verification code.');
  };

  const handleEmailNotVerified = (email: string) => {
    setVerificationEmail(email);
    setMode('verify');
    setSuccessMessage('Please verify your email address to continue.');
  };

  const handleVerificationSuccess = () => {
    setSuccessMessage('Email verified successfully! You can now sign in.');
    setTimeout(() => {
      setMode('login');
      setSuccessMessage('');
    }, 2000);
  };

  const handleResendCode = () => {
    setSuccessMessage('Verification code sent! Please check your email.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const switchToLogin = () => {
    setMode('login');
    setSuccessMessage('');
  };

  const switchToRegister = () => {
    setMode('register');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {mode === 'login' && (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={switchToRegister}
              onEmailNotVerified={handleEmailNotVerified}
            />
          )}

          {mode === 'register' && (
            <RegistrationForm
              onRegistrationSuccess={handleRegistrationSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}

          {mode === 'verify' && (
            <EmailVerification
              email={verificationEmail}
              onVerificationSuccess={handleVerificationSuccess}
              onResendCode={handleResendCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}