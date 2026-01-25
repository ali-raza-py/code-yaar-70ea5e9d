import { Check, Circle } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

export function ProgressBar({ currentStep, totalSteps, completedSteps }: ProgressBarProps) {
  const progress = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="bg-card rounded-xl border border-border p-4 sticky top-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="font-display font-semibold">Your Progress</span>
        </div>
        <span className="text-sm font-medium text-primary">
          Step {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className="w-4 h-4 text-primary" />
          <span>{completedSteps.length} completed</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Circle className="w-4 h-4" />
          <span>{totalSteps - completedSteps.length} remaining</span>
        </div>
      </div>

      {/* Mini step indicators */}
      <div className="mt-4 flex flex-wrap gap-1">
        {Array.from({ length: Math.min(totalSteps, 20) }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium transition-colors ${
              completedSteps.includes(step)
                ? "bg-primary text-primary-foreground"
                : step === currentStep
                ? "bg-primary/20 text-primary border border-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {completedSteps.includes(step) ? <Check className="w-3 h-3" /> : step}
          </div>
        ))}
        {totalSteps > 20 && (
          <span className="text-xs text-muted-foreground self-center ml-1">
            +{totalSteps - 20} more
          </span>
        )}
      </div>
    </div>
  );
}
