import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [isGoogleAuthLoading, setIsGoogleAuthLoading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Enhanced error handling for OAuth parameters (like Flask example)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    const provider = urlParams.get('provider');

    if (error) {
      let errorMessage = "Authentication failed";
      
      switch (error) {
        case 'oauth_init_failed':
          errorMessage = `Failed to initiate ${provider || 'OAuth'} authentication`;
          break;
        case 'google_error':
          errorMessage = message ? decodeURIComponent(message) : 'Google authentication failed';
          break;
        case 'google_auth_failed':
          errorMessage = 'Google authentication was unsuccessful';
          break;
        case 'state_mismatch':
          errorMessage = 'Security validation failed. Please try again.';
          break;
        case 'auth_failed':
          errorMessage = message ? decodeURIComponent(message) : 'Authentication failed';
          break;
        case 'callback_failed':
          errorMessage = 'Authentication callback processing failed';
          break;
        case 'redirect_failed':
          errorMessage = 'Failed to complete authentication redirect';
          break;
        default:
          errorMessage = message ? decodeURIComponent(message) : 'An authentication error occurred';
      }

      console.error('OAuth Error:', { error, message, provider });
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Clean up URL parameters after showing error
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [toast]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Traditional login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = "/"; // Full page reload to update auth state
    },
    onError: (error: Error) => {
      setError("Invalid email or password");
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  // Traditional registration mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = "/"; // Full page reload to update auth state
    },
    onError: (error: Error) => {
      setError("Registration failed. Please try again.");
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate(registerForm);
  };

  // Enhanced Google sign-in with comprehensive error handling (Flask-inspired)
  const handleGoogleSignIn = () => {
    try {
      setIsGoogleAuthLoading(true);
      setError("");
      
      console.log("Initiating Google OAuth flow");
      
      // Store current page for return URL (like Flask state management)
      const currentPath = window.location.pathname;
      const returnTo = currentPath !== '/auth' ? currentPath : '/';
      
      // Build Google OAuth URL with return parameter
      const googleAuthUrl = `/api/auth/google${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      
      console.log("Redirecting to:", googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
      setIsGoogleAuthLoading(false);
      setError("Failed to initiate Google sign-in");
      toast({
        title: "Sign-in Error",
        description: "Failed to start Google authentication. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show loading if checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Authentication forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to ContractAI</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account or create a new one
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Authentication</CardTitle>
              <CardDescription className="text-center">
                Choose your preferred sign-in method
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Enhanced Google Sign In Button with loading state */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full mb-4 flex items-center justify-center gap-2"
                disabled={isGoogleAuthLoading || loginMutation.isPending || registerMutation.isPending}
              >
                {isGoogleAuthLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to Google...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, password: e.target.value })
                        }
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="register-firstName">First Name</Label>
                        <Input
                          id="register-firstName"
                          type="text"
                          value={registerForm.firstName}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-lastName">Last Name</Label>
                        <Input
                          id="register-lastName"
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, email: e.target.value })
                        }
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                        }
                        required
                        placeholder="Create a password"
                        minLength={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-indigo-600">
        <div className="max-w-md text-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-6">
              AI-Powered Contract Analysis
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Transform complex legal documents into clear, actionable insights with our 
              advanced AI technology.
            </p>
            <div className="space-y-4 text-left text-indigo-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Plain language summaries</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Risk assessment and analysis</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Key terms identification</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                <span>Actionable recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}