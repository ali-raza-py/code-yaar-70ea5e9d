import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i + 1 <= currentStep
                ? "bg-primary shadow-lg shadow-primary/30"
                : "bg-secondary/50"
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: i + 1 === currentStep ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
