import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Code2, BookOpen, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface StepContent {
  id: number;
  title: string;
  concept: string;
  tutorial: string;
  code: string;
  task: string;
  whatToLearn: string[];
}

interface RoadmapStepProps {
  step: StepContent;
  isCompleted: boolean;
  isCurrent: boolean;
  onComplete: () => void;
  onOpenInCanvas: (code: string) => void;
}

export function RoadmapStep({ step, isCompleted, isCurrent, onComplete, onOpenInCanvas }: RoadmapStepProps) {
  const [isExpanded, setIsExpanded] = useState(isCurrent);

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        isCurrent
          ? "border-primary bg-primary/5 shadow-glow"
          : isCompleted
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isCompleted
              ? "bg-primary text-primary-foreground"
              : isCurrent
              ? "bg-primary/20 text-primary border-2 border-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? <Check className="w-5 h-5" /> : step.id}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold truncate">{step.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{step.concept}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="h-px bg-border" />
          
          {/* Tutorial */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <BookOpen className="w-4 h-4" />
              Tutorial
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{step.tutorial}</p>
          </div>

          {/* Code Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Code2 className="w-4 h-4" />
                Code Example
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenInCanvas(step.code)}
                className="text-xs"
              >
                Open in Code Canvas
              </Button>
            </div>
            <pre className="p-4 rounded-lg bg-code text-code-text font-mono text-sm overflow-x-auto">
              <code>{step.code}</code>
            </pre>
          </div>

          {/* Mini Task */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Target className="w-4 h-4" />
              Mini Task
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">{step.task}</p>
            </div>
          </div>

          {/* What You Should Learn */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lightbulb className="w-4 h-4" />
              What You Should Learn
            </div>
            <ul className="space-y-1">
              {step.whatToLearn.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {!isCompleted && (
            <Button
              onClick={onComplete}
              className="w-full"
              variant="default"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Completed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
