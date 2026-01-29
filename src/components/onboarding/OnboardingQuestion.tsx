import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface OnboardingQuestionProps {
  question: string;
  subtitle?: string;
  options: Option[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function OnboardingQuestion({
  question,
  subtitle,
  options,
  selectedValue,
  onSelect,
}: OnboardingQuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-3"
        >
          {question}
        </motion.h2>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            onClick={() => onSelect(option.value)}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
              selectedValue === option.value
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80"
            }`}
          >
            {/* Selection indicator */}
            <div
              className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                selectedValue === option.value
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              }`}
            >
              {selectedValue === option.value && (
                <Check className="w-4 h-4 text-primary-foreground" />
              )}
            </div>

            {/* Icon */}
            {option.icon && (
              <span className="text-3xl mb-3 block">{option.icon}</span>
            )}

            {/* Label */}
            <h3
              className={`font-semibold text-lg mb-1 transition-colors ${
                selectedValue === option.value
                  ? "text-primary"
                  : "text-foreground group-hover:text-primary"
              }`}
            >
              {option.label}
            </h3>

            {/* Description */}
            {option.description && (
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
