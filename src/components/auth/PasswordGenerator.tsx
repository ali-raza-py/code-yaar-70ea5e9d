import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Copy, Check, RefreshCw } from "lucide-react";

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

const generateSecurePassword = (length: number = 16): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // Ensure at least one of each type
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split("").sort(() => Math.random() - 0.5).join("");
};

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

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleGenerate = useCallback(() => {
    const password = generateSecurePassword(16);
    setGeneratedPassword(password);
    setIsVisible(true);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedPassword]);

  const handleUsePassword = useCallback(() => {
    if (!generatedPassword) return;
    onPasswordGenerated(generatedPassword);
    setIsVisible(false);
    setGeneratedPassword("");
  }, [generatedPassword, onPasswordGenerated]);

  const strength = generatedPassword ? getPasswordStrength(generatedPassword) : null;

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        className="w-full text-xs gap-2"
      >
        <Wand2 className="w-3 h-3" />
        Suggest Strong Password
      </Button>

      {isVisible && generatedPassword && (
        <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted px-2 py-1.5 rounded overflow-x-auto">
              {generatedPassword}
            </code>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>

          {/* Strength Indicator */}
          {strength && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Strength:</span>
                <span className={`font-medium ${
                  strength.label === "Weak" ? "text-destructive" :
                  strength.label === "Medium" ? "text-yellow-500" :
                  strength.label === "Good" ? "text-blue-500" : "text-green-500"
                }`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.percentage}%` }}
                />
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="hero"
            size="sm"
            onClick={handleUsePassword}
            className="w-full text-xs"
          >
            Use This Password
          </Button>
        </div>
      )}
    </div>
  );
}
