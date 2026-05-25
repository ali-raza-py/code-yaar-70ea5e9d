import { motion } from "framer-motion";
import { Clock, ChevronRight, ChevronLeft, CheckCircle, Zap, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Progress } from "@/components/ui/progress";
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
  totalLessons?: number;
  completedCount?: number;
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
  totalLessons,
  completedCount,
}: LessonContentProps) {
  const overallProgress =
    totalLessons && totalLessons > 0
      ? ((completedCount ?? 0) / totalLessons) * 100
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Colorful Lesson Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-7 md:p-9 mb-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl"
      >
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_2px,transparent_2px),radial-gradient(circle_at_80%_70%,white_1.5px,transparent_1.5px)] [background-size:48px_48px,32px_32px]" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <BookOpen className="w-3.5 h-3.5" /> Lesson {lessonOrder}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" /> {estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-300 text-amber-900 px-3 py-1 rounded-full font-bold">
              <Zap className="w-3.5 h-3.5" /> +{xpReward} XP
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-sm">
            {title}
          </h1>
          {overallProgress !== undefined && (
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-2 text-white/90">
                <span>Course progress</span>
                <span className="font-semibold">
                  {completedCount}/{totalLessons}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lesson Content - Block-based renderer with Markdown support */}
      <article className="relative rounded-2xl bg-card border border-border/60 shadow-sm px-6 md:px-10 py-8 md:py-10">
        <BlockContentRenderer content={content} />
      </article>

      {/* Completion & Navigation */}
      <GlassCard className="p-6 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Lesson complete!</span>
              </div>
            ) : (
              <Button
                onClick={onComplete}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mark Complete (+{xpReward} XP)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={onNext}
              disabled={!hasNext}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
