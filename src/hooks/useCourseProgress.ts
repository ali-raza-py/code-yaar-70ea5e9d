import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
}

interface CourseProgressData {
  lessonProgress: Record<string, LessonProgress>;
  completedCount: number;
  totalLessons: number;
  progressPercentage: number;
  isLoading: boolean;
}

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [totalLessons, setTotalLessons] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress data
  useEffect(() => {
    if (!user || !courseId) {
      setIsLoading(false);
      return;
    }

    fetchProgress();
  }, [user, courseId]);

  const fetchProgress = async () => {
    if (!user || !courseId) return;

    try {
      // Fetch lesson progress
      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("lesson_id, is_completed, completed_at")
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (progressError) throw progressError;

      const progressMap: Record<string, LessonProgress> = {};
      progressData?.forEach((p) => {
        progressMap[p.lesson_id] = {
          lesson_id: p.lesson_id,
          is_completed: p.is_completed || false,
          completed_at: p.completed_at,
        };
      });

      setLessonProgress(progressMap);

      // Get total lessons count
      const { count, error: countError } = await supabase
        .from("course_lessons")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("is_published", true);

      if (countError) throw countError;
      setTotalLessons(count || 0);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = useCallback(
    async (lessonId: string, xpReward: number = 50) => {
      if (!user || !courseId) {
        toast({
          title: "Error",
          description: "You must be logged in to track progress",
          variant: "destructive",
        });
        return false;
      }

      try {
        // Check if progress already exists
        const { data: existing } = await supabase
          .from("lesson_progress")
          .select("id, is_completed")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single();

        if (existing?.is_completed) {
          // Already completed
          return true;
        }

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from("lesson_progress")
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase.from("lesson_progress").insert({
            user_id: user.id,
            course_id: courseId,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });

          if (error) throw error;
        }

        // Award XP
        await awardXP(xpReward);

        // Update local state
        setLessonProgress((prev) => ({
          ...prev,
          [lessonId]: {
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
          },
        }));

        toast({
          title: "🎉 Lesson Complete!",
          description: `You earned ${xpReward} XP!`,
        });

        return true;
      } catch (error) {
        console.error("Error marking lesson complete:", error);
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, courseId, toast]
  );

  const awardXP = async (xp: number) => {
    if (!user) return;

    try {
      // Get current gamification data
      const { data: gamification } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (gamification) {
        // Calculate new level
        const newXP = (gamification.xp_points || 0) + xp;
        const newLevel = Math.floor(newXP / 500) + 1;
        const newLessonsCompleted = (gamification.total_lessons_completed || 0) + 1;

        await supabase
          .from("user_gamification")
          .update({
            xp_points: newXP,
            level: newLevel,
            total_lessons_completed: newLessonsCompleted,
            last_activity_date: new Date().toISOString().split("T")[0],
          })
          .eq("user_id", user.id);
      } else {
        // Create new gamification record
        await supabase.from("user_gamification").insert({
          user_id: user.id,
          xp_points: xp,
          level: 1,
          total_lessons_completed: 1,
          last_activity_date: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return lessonProgress[lessonId]?.is_completed || false;
    },
    [lessonProgress]
  );

  const completedCount = Object.values(lessonProgress).filter(
    (p) => p.is_completed
  ).length;

  const progressPercentage =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return {
    lessonProgress,
    completedCount,
    totalLessons,
    progressPercentage,
    isLoading,
    markLessonComplete,
    isLessonCompleted,
    refetch: fetchProgress,
  };
}
