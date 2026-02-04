import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Code2, Lock, ArrowRight, Loader2, ShieldCheck, AlertTriangle, Eye, EyeOff, BookOpen, Award } from "lucide-react";
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
  
  if (score <= 2) return { label: "Weak", color: "bg-red-500", percentage: 25 };
  if (score <= 4) return { label: "Medium", color: "bg-amber-500", percentage: 50 };
  if (score <= 5) return { label: "Good", color: "bg-blue-500", percentage: 75 };
  return { label: "Strong", color: "bg-emerald-500", percentage: 100 };
};

export default function Auth() {
  const { user, signIn, signUp, isLoading: authLoading } = useAuth();
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Blue Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Code-Yaar</span>
        </Link>
        
        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
              {isLogin ? "Welcome" : "Start your"}
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                {isLogin ? "back." : "journey."}
              </span>
            </h1>
          </motion.div>
          
          <p className="text-lg text-slate-400 max-w-sm leading-relaxed">
            {isLogin 
              ? "Continue your learning journey with structured courses and hands-on practice."
              : "Join thousands of students mastering programming the right way."}
          </p>

          <div className="flex items-center gap-8 pt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-slate-500">Active Learners</div>
            </motion.div>
            <div className="w-px h-12 bg-slate-700" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">50+</div>
              <div className="text-sm text-slate-500">Courses</div>
            </motion.div>
            <div className="w-px h-12 bg-slate-700" />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">95%</div>
              <div className="text-sm text-slate-500">Completion</div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="relative z-10 space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-sm">Structured learning paths</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Code2 className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-sm">Real-world code examples</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Award className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-sm">Verified certificates</span>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 py-12 px-6 sm:px-12 lg:px-16">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={isLogin ? "login" : "signup"}
        >
          {/* Mobile Logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">Code-Yaar</span>
          </Link>

          {isBlocked && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-600">Account Temporarily Locked</p>
                <p className="text-xs text-red-500 mt-1">
                  Too many failed attempts. Wait {blockTimeRemaining} minutes.
                </p>
              </div>
            </motion.div>
          )}

          {/* Auth Card */}
          <motion.div 
            className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                    className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors"
                  />
                </motion.div>
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
                  className={`h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors ${errors.email ? "border-red-400" : ""}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="text-xs text-blue-600 hover:underline font-medium">
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
                    className={`h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors pr-10 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                
                {/* Password Strength Indicator */}
                {!isLogin && formData.password && passwordStrength && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-1.5"
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Password strength</span>
                      <span className={`font-medium ${
                        passwordStrength.label === "Weak" ? "text-red-500" :
                        passwordStrength.label === "Medium" ? "text-amber-500" :
                        passwordStrength.label === "Good" ? "text-blue-500" : "text-emerald-500"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.percentage}%` }}
                        className={`h-full rounded-full ${
                          passwordStrength.label === "Weak" ? "bg-red-500" :
                          passwordStrength.label === "Medium" ? "bg-amber-500" :
                          passwordStrength.label === "Good" ? "bg-blue-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </motion.div>
                )}

                {!isLogin && (
                  <div className="mt-3">
                    <PasswordGenerator onPasswordGenerated={handlePasswordGenerated} />
                  </div>
                )}
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
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
                      className={`h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors pr-10 ${errors.confirmPassword ? "border-red-400" : ""}`}
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
                    <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25"
                disabled={isLoading || isBlocked}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? "Login now" : "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secured with encryption</span>
            </div>
          </motion.div>

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
                className="text-blue-600 font-semibold hover:underline"
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
        </motion.div>
      </div>
    </div>
  );
}
