import { ChevronLeft, CheckCircle, Circle, Lock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  lesson_order: number;
  estimated_minutes: number;
  is_completed?: boolean;
  is_locked?: boolean;
}

interface LessonSidebarProps {
  courseTitle: string;
  courseSlug: string;
  lessons: Lesson[];
  currentLessonId: string;
  completedCount: number;
  onClose?: () => void;
}

export function LessonSidebar({
  courseTitle,
  courseSlug,
  lessons,
  currentLessonId,
  completedCount,
  onClose,
}: LessonSidebarProps) {
  const progressPercentage = lessons.length > 0 
    ? (completedCount / lessons.length) * 100 
    : 0;

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-xl border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link
          to="/courses"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          All Courses
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground line-clamp-2">{courseTitle}</h2>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">
              {completedCount}/{lessons.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Lessons List */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {lessons.map((lesson, index) => {
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = lesson.is_completed;
            const isLocked = lesson.is_locked;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={isLocked ? "#" : `/courses/${courseSlug}/${lesson.slug}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-all",
                    isCurrent
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-secondary/50",
                    isLocked && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Circle
                        className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground mb-0.5 block">
                      Lesson {lesson.lesson_order}
                    </span>
                    <h3
                      className={cn(
                        "text-sm font-medium line-clamp-2",
                        isCurrent ? "text-primary" : "text-foreground"
                      )}
                    >
                      {lesson.title}
                    </h3>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {lesson.estimated_minutes} min
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
