import { motion } from "framer-motion";
import { Clock, ChevronRight, ChevronLeft, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BlockContentRenderer } from "./BlockContentRenderer";

interface LessonContentProps {
  title: string;
  content: string;
  lessonOrder: number;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function LessonContent({
  title,
  content,
  lessonOrder,
  estimatedMinutes,
  xpReward,
  isCompleted,
  hasNext,
  hasPrevious,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
}: LessonContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Lesson {lessonOrder}</span>
          <span>•</span>
          <Clock className="w-4 h-4" />
          <span>{estimatedMinutes} min read</span>
          <span>•</span>
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{xpReward} XP</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Lesson Content - Block-based renderer with Markdown support */}
      <BlockContentRenderer content={content} />

      {/* Completion & Navigation */}
      <GlassCard className="p-6 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed!</span>
              </div>
            ) : (
              <Button
                onClick={onComplete}
                disabled={isLoading}
                variant="hero"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete (+{xpReward} XP)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button onClick={onNext} disabled={!hasNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
