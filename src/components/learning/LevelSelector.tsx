import { Check, GraduationCap, Lightbulb, Rocket } from "lucide-react";

export type Level = "beginner" | "intermediate" | "advanced";

const levels: { id: Level; name: string; icon: React.ElementType; description: string; steps: number; color: string }[] = [
  { id: "beginner", name: "Beginner", icon: Lightbulb, description: "Starting from scratch? Perfect! Learn fundamentals step by step.", steps: 20, color: "text-green-500" },
  { id: "intermediate", name: "Intermediate", icon: GraduationCap, description: "Know the basics? Level up with patterns and best practices.", steps: 15, color: "text-yellow-500" },
  { id: "advanced", name: "Advanced", icon: Rocket, description: "Ready for mastery? Tackle complex projects and optimizations.", steps: 12, color: "text-red-500" },
];

interface LevelSelectorProps {
  selectedLevel: Level | null;
  onSelect: (level: Level) => void;
  disabled?: boolean;
}

export function LevelSelector({ selectedLevel, onSelect, disabled }: LevelSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Step 3 of 4
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Select Your Level</h2>
        <p className="text-muted-foreground">We'll customize your learning path based on your experience</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {levels.map((level) => {
          const Icon = level.icon;
          return (
            <button
              key={level.id}
              onClick={() => !disabled && onSelect(level.id)}
              disabled={disabled}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                selectedLevel === level.id
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card hover:border-primary/50"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {selectedLevel === level.id && (
                <div className="absolute top-3 right-3">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className={`p-3 rounded-full bg-muted ${level.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <span className="font-display font-bold text-lg">{level.name}</span>
              <span className="text-sm text-muted-foreground text-center">{level.description}</span>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {level.steps} Steps
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
