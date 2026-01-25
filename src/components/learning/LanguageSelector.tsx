import { Check } from "lucide-react";

export type Language = "python" | "javascript" | "typescript" | "java" | "csharp" | "cpp" | "c" | "go" | "rust" | "sql" | "html";

export const languages: { id: Language; name: string; icon: string; description: string }[] = [
  { id: "python", name: "Python", icon: "🐍", description: "Great for beginners, AI & data science" },
  { id: "javascript", name: "JavaScript", icon: "🟨", description: "Web development & interactive sites" },
  { id: "typescript", name: "TypeScript", icon: "🔷", description: "JavaScript with type safety" },
  { id: "java", name: "Java", icon: "☕", description: "Enterprise apps & Android" },
  { id: "csharp", name: "C#", icon: "🟪", description: "Game dev & Windows apps" },
  { id: "cpp", name: "C++", icon: "⚡", description: "Systems programming & performance" },
  { id: "c", name: "C", icon: "🔧", description: "Low-level systems & embedded" },
  { id: "go", name: "Go", icon: "🐹", description: "Cloud & concurrent systems" },
  { id: "rust", name: "Rust", icon: "🦀", description: "Memory-safe systems programming" },
  { id: "sql", name: "SQL", icon: "🗄️", description: "Database queries & management" },
  { id: "html", name: "HTML/CSS", icon: "🌐", description: "Web structure & styling" },
];

interface LanguageSelectorProps {
  selectedLanguage: Language | null;
  onSelect: (language: Language) => void;
  disabled?: boolean;
}

export function LanguageSelector({ selectedLanguage, onSelect, disabled }: LanguageSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Step 1 of 3
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Choose Your Language</h2>
        <p className="text-muted-foreground">Pick the programming language you want to master</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => !disabled && onSelect(lang.id)}
            disabled={disabled}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 ${
              selectedLanguage === lang.id
                ? "border-primary bg-primary/10 shadow-glow"
                : "border-border bg-card hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {selectedLanguage === lang.id && (
              <div className="absolute top-2 right-2">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-3xl">{lang.icon}</span>
            <span className="font-semibold text-sm">{lang.name}</span>
            <span className="text-xs text-muted-foreground text-center line-clamp-2">{lang.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
