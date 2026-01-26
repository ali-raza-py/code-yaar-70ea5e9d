import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordStrengthInfo {
  needsUpdate: boolean;
  passwordLength: number;
  strength: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  passwordStrength: PasswordStrengthInfo | null;
  clearPasswordUpdateRequired: () => void;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthInfo | null>(null);
  const { toast } = useToast();

  const checkPasswordStrength = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("password_metadata")
        .select("password_length, strength")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking password strength:", error);
        // If no metadata exists, assume password needs update for existing users
        setPasswordStrength({ needsUpdate: true, passwordLength: 0, strength: "unknown" });
        return;
      }

      if (!data) {
        // No password metadata means user hasn't set a compliant password yet
        setPasswordStrength({ needsUpdate: true, passwordLength: 0, strength: "unknown" });
        return;
      }

      const needsUpdate = data.password_length < 9 || data.strength === "weak";
      setPasswordStrength({
        needsUpdate,
        passwordLength: data.password_length,
        strength: data.strength,
      });
    } catch (error) {
      console.error("Error checking password strength:", error);
      setPasswordStrength({ needsUpdate: true, passwordLength: 0, strength: "unknown" });
    }
  };

  const clearPasswordUpdateRequired = () => {
    setPasswordStrength((prev) => prev ? { ...prev, needsUpdate: false } : null);
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role and password checks to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
            // Only check password strength on sign in events
            if (event === "SIGNED_IN") {
              checkPasswordStrength(session.user.id);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setPasswordStrength(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
        checkPasswordStrength(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    }
  };

  const getPasswordStrengthLabel = (password: string): string => {
    let score = 0;
    if (password.length >= 9) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    if (score <= 5) return "good";
    return "strong";
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || "",
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      // Save password metadata for new user
      if (signUpData.user) {
        const strengthLabel = getPasswordStrengthLabel(password);
        await supabase.from("password_metadata").insert({
          user_id: signUpData.user.id,
          password_length: password.length,
          strength: strengthLabel,
        });

        // Set password strength state
        setPasswordStrength({
          needsUpdate: password.length < 9 || strengthLabel === "weak",
          passwordLength: password.length,
          strength: strengthLabel,
        });
      }

      toast({
        title: "Account created!",
        description: "Welcome to Code-Yaar. You're now signed in.",
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You're now signed in to Code-Yaar.",
      });

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        passwordStrength,
        clearPasswordUpdateRequired,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
