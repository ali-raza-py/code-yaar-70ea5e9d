import { GitBranch, FileText } from "lucide-react";
import { motion } from "framer-motion";

export type RoadmapType = "flowchart" | "text";

interface RoadmapTypeSelectorProps {
  selectedType: RoadmapType | null;
  onSelect: (type: RoadmapType) => void;
}

export function RoadmapTypeSelector({ selectedType, onSelect }: RoadmapTypeSelectorProps) {
  const options = [
    {
      id: "flowchart" as RoadmapType,
      title: "Flowchart Roadmap",
      description: "Visual learning path with connected nodes showing what to learn first, second, and beyond.",
      icon: GitBranch,
      gradient: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50",
      borderActive: "border-violet-500",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      id: "text" as RoadmapType,
      title: "Text-based Roadmap",
      description: "Step-by-step written guide with detailed explanations, code examples, and practice tasks.",
      icon: FileText,
      gradient: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      borderActive: "border-emerald-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          Step 2 of 4
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Choose Your Roadmap Style</h2>
        <p className="text-muted-foreground">Pick how you'd like to visualize your learning journey</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {options.map((option, idx) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;
          
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(option.id)}
              className={`relative group flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                isSelected
                  ? `${option.borderActive} ${option.bgLight} shadow-lg`
                  : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-md"
              }`}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              {/* Icon */}
              <div className={`relative p-4 rounded-2xl ${option.iconBg} mb-4`}>
                <Icon className={`w-10 h-10 ${option.iconColor}`} />
              </div>
              
              {/* Title */}
              <h3 className="font-display text-xl font-bold mb-2">{option.title}</h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
              
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
