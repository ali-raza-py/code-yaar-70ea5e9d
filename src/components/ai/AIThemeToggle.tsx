import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIThemeToggleProps {
  onThemeChange?: (isDark: boolean) => void;
}

export function AIThemeToggle({ onThemeChange }: AIThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const stored = localStorage.getItem("ai-tool-theme");
    if (stored) {
      setIsDark(stored === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("ai-tool-theme", newValue ? "dark" : "light");
    onThemeChange?.(newValue);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
