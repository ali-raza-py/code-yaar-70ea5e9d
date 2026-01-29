import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { LessonSidebar } from "@/components/courses/LessonSidebar";
import { LessonContent } from "@/components/courses/LessonContent";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  lesson_order: number;
  estimated_minutes: number;
  xp_reward: number;
  lesson_type: string;
}

export default function CourseViewer() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug?: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { 
    completedCount, 
    isLessonCompleted, 
    markLessonComplete 
  } = useCourseProgress(course?.id);

  // Fetch course and lessons
  useEffect(() => {
    if (slug) {
      fetchCourseData();
    }
  }, [slug]);

  // Set current lesson when URL changes or lessons load
  useEffect(() => {
    if (lessons.length > 0) {
      if (lessonSlug) {
        const lesson = lessons.find((l) => l.slug === lessonSlug);
        setCurrentLesson(lesson || lessons[0]);
      } else {
        // Navigate to first lesson
        navigate(`/courses/${slug}/${lessons[0].slug}`, { replace: true });
      }
    }
  }, [lessons, lessonSlug, slug, navigate]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, slug, description")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseData.id)
        .eq("is_published", true)
        .order("lesson_order", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error fetching course:", error);
      navigate("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentLesson) return;
    setIsSaving(true);
    await markLessonComplete(currentLesson.id, currentLesson.xp_reward);
    setIsSaving(false);
  };

  const handleNext = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      navigate(`/courses/${slug}/${nextLesson.slug}`);
    }
  };

  const handlePrevious = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      navigate(`/courses/${slug}/${prevLesson.slug}`);
    }
  };

  const currentIndex = currentLesson
    ? lessons.findIndex((l) => l.id === currentLesson.id)
    : -1;

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24 px-4">
        <GlassCard className="p-12 text-center max-w-md">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No Lessons Yet
          </h2>
          <p className="text-muted-foreground mb-6">
            This course doesn't have any lessons yet. Check back soon!
          </p>
          <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
        </GlassCard>
      </div>
    );
  }

  // Prepare lessons with progress
  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    is_completed: isLessonCompleted(lesson.id),
    is_locked: false, // All lessons are unlocked for now
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            <span className="ml-2">Lessons</span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {lessons.length}
          </span>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-20">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-80 fixed left-0 top-20 bottom-0 overflow-y-auto">
          <LessonSidebar
            courseTitle={course.title}
            courseSlug={course.slug}
            lessons={lessonsWithProgress}
            currentLessonId={currentLesson?.id || ""}
            completedCount={completedCount}
          />
        </aside>

        {/* Sidebar - Mobile Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className="w-80 h-full bg-card border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <LessonSidebar
                courseTitle={course.title}
                courseSlug={course.slug}
                lessons={lessonsWithProgress}
                currentLessonId={currentLesson?.id || ""}
                completedCount={completedCount}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.aside>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            {currentLesson && (
              <LessonContent
                title={currentLesson.title}
                content={currentLesson.content || ""}
                lessonOrder={currentLesson.lesson_order}
                estimatedMinutes={currentLesson.estimated_minutes}
                xpReward={currentLesson.xp_reward}
                isCompleted={isLessonCompleted(currentLesson.id)}
                hasNext={currentIndex < lessons.length - 1}
                hasPrevious={currentIndex > 0}
                onComplete={handleComplete}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLoading={isSaving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
