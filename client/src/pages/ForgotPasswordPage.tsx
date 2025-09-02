import { useLocation } from 'wouter';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();

  const handleBackToLogin = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
    </div>
  );
}