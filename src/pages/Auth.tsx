import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, AlertTriangle, Eye, EyeOff, BookOpen, Award } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PasswordGenerator } from "@/components/auth/PasswordGenerator";

// Strong password validation schema (used for SIGN UP only)
const passwordSchema = z.string()
  .min(9, "Password must be at least 9 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain a special character");

// Login should NOT enforce strength (so existing weak-password users can sign in and then are forced to update)
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255, "Email too long"),
  password: z.string().min(1, "Password is required").max(128, "Password too long"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255, "Email too long"),
  password: passwordSchema,
  fullName: z.string().max(100, "Name too long").optional(),
  confirmPassword: z.string().optional(),
});

const getPasswordStrength = (password: string): { label: string; color: string; percentage: number } => {
  let score = 0;
  
  if (password.length >= 9) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return { label: "Weak", color: "bg-destructive", percentage: 25 };
  if (score <= 4) return { label: "Medium", color: "bg-yellow-500", percentage: 50 };
  if (score <= 5) return { label: "Good", color: "bg-blue-500", percentage: 75 };
  return { label: "Strong", color: "bg-green-500", percentage: 100 };
};

export default function Auth() {
  const { user, signIn, signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const checkIfBlocked = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_login_blocked', { user_email: email });
      if (error) {
        console.error("Error checking block status:", error);
        return false;
      }
      return data === true;
    } catch {
      return false;
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.rpc('record_login_attempt', {
        user_email: email,
        was_successful: success,
        client_ip: null
      });
    } catch {
      // Silently fail
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      if (isLogin) {
        loginSchema.parse({
          email: formData.email,
          password: formData.password,
        });
      } else {
        signupSchema.parse({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isLogin) {
      const blocked = await checkIfBlocked(formData.email);
      if (blocked) {
        setIsBlocked(true);
        setBlockTimeRemaining(15);
        setErrors({ email: "Too many failed attempts. Please wait 15 minutes before trying again." });
        return;
      }
    }

    setIsLoading(true);

    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      await logLoginAttempt(formData.email, !error);
      
      if (error) {
        const blocked = await checkIfBlocked(formData.email);
        if (blocked) {
          setIsBlocked(true);
          setBlockTimeRemaining(15);
          setErrors({ email: "Too many failed attempts. Account temporarily locked for 15 minutes." });
        }
      } else {
        navigate(from, { replace: true });
      }
    } else {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (!error) {
        navigate(from, { replace: true });
      }
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsBlocked(false);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordGenerated = (password: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      password, 
      confirmPassword: password 
    }));
    setErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Blue Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-slate-900" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Code-Yaar</span>
        </Link>
        
        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
              {isLogin ? "Welcome" : "Start your"}
              <br />
              <span className="text-primary">{isLogin ? "back." : "journey."}</span>
            </h1>
          </div>
          
          <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
            {isLogin 
              ? "Continue your learning journey with structured courses and hands-on practice."
              : "Join thousands of students mastering programming the right way."}
          </p>

          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-slate-500">Active Learners</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-slate-500">Courses</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-slate-500">Completion</div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm">Structured learning paths</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Code2 className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm">Real-world code examples</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm">Verified certificates</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Code-Yaar</span>
          </Link>

          {isBlocked && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Account Temporarily Locked</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Too many failed attempts. Wait {blockTimeRemaining} minutes.
                </p>
              </div>
            </div>
          )}

          {/* Auth Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                {isLogin ? "Login to your account" : "Create an account"}
              </h2>
              <p className="text-slate-500 text-sm">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Fill in your details to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2 text-slate-700">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    maxLength={100}
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  maxLength={255}
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    maxLength={128}
                    className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password}</p>}
                
                {/* Password Strength Indicator */}
                {!isLogin && formData.password && passwordStrength && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength.label === "Weak" ? "text-red-500" :
                        passwordStrength.label === "Medium" ? "text-amber-500" :
                        passwordStrength.label === "Good" ? "text-blue-500" : "text-green-500"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          passwordStrength.label === "Weak" ? "bg-red-500" :
                          passwordStrength.label === "Medium" ? "bg-amber-500" :
                          passwordStrength.label === "Good" ? "bg-blue-500" : "bg-green-500"
                        }`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="mt-3">
                    <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
                  </div>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      maxLength={128}
                      className={`h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-destructive text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/25"
                disabled={isLoading || isBlocked}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? "Login now" : "Create account"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-slate-200 hover:bg-slate-50 font-medium"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isBlocked}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured with encryption</span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setIsBlocked(false);
                }}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
