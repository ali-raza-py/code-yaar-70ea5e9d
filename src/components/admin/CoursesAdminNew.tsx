import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  FileText,
  Layers,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LessonBlockEditor } from "./lesson-editor/LessonBlockEditor";
import { LessonBlock } from "./lesson-editor/BlockTypes";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  estimated_hours: number | null;
  total_lessons: number | null;
  xp_reward: number | null;
  is_published: boolean | null;
  is_featured: boolean | null;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  content: string | null;
  lesson_order: number;
  estimated_minutes: number | null;
  xp_reward: number | null;
  is_published: boolean | null;
  lesson_type: string | null;
}

const CATEGORIES = [
  { value: "web", label: "Web Development", color: "bg-blue-500" },
  { value: "python", label: "Python", color: "bg-emerald-500" },
  { value: "ai_ml", label: "AI / Machine Learning", color: "bg-violet-500" },
  { value: "dsa", label: "Data Structures", color: "bg-amber-500" },
  { value: "devops", label: "DevOps", color: "bg-rose-500" },
  { value: "databases", label: "Databases", color: "bg-cyan-500" },
  { value: "cybersecurity", label: "Cybersecurity", color: "bg-red-500" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner", color: "text-emerald-500" },
  { value: "intermediate", label: "Intermediate", color: "text-amber-500" },
  { value: "advanced", label: "Advanced", color: "text-rose-500" },
];

export function CoursesAdminNew() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Course form state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "web",
    difficulty: "beginner",
    estimated_hours: 10,
    is_published: true,
    is_featured: false,
  });

  // Lesson form state
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    slug: "",
    lesson_order: 1,
    estimated_minutes: 15,
    lesson_type: "theory",
    is_published: true,
  });
  const [lessonBlocks, setLessonBlocks] = useState<LessonBlock[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch courses", variant: "destructive" });
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  };

  const fetchLessons = async (courseId: string) => {
    const { data, error } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("lesson_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch lessons", variant: "destructive" });
    } else {
      setLessons((prev) => ({ ...prev, [courseId]: data || [] }));
    }
  };

  const toggleCourseExpand = (courseId: string) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      if (!lessons[courseId]) {
        fetchLessons(courseId);
      }
    }
  };

  // Calculate XP from blocks (practice blocks only)
  const calculateLessonXp = (blocks: LessonBlock[]): number => {
    const practiceXp = blocks
      .filter((b) => b.type === "practice")
      .reduce((sum, b) => sum + (b.type === "practice" ? b.xpValue : 0), 0);
    // Base XP for completing the lesson + practice XP
    return 25 + practiceXp;
  };

  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      // XP is auto-calculated from lessons, not set manually
      const courseData = {
        ...courseForm,
        xp_reward: 0, // Will be calculated from lessons
      };

      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        const { error } = await supabase.from("courses").insert(courseData);
        if (error) throw error;
        toast({ title: "Success", description: "Course created successfully" });
      }

      setIsAddingCourse(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course and all its lessons?")) return;

    const { error } = await supabase.from("courses").delete().eq("id", courseId);

    if (error) {
      toast({ title: "Error", description: "Failed to delete course", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Course deleted successfully" });
      fetchCourses();
    }
  };

  const handleSaveLesson = async (courseId: string) => {
    setIsSaving(true);
    try {
      // Convert blocks to content JSON and calculate XP
      const content = JSON.stringify(lessonBlocks);
      const xpReward = calculateLessonXp(lessonBlocks);

      const lessonData = {
        ...lessonForm,
        content,
        xp_reward: xpReward,
        course_id: courseId,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        const { error } = await supabase.from("course_lessons").insert(lessonData);
        if (error) throw error;
        toast({ title: "Success", description: "Lesson created successfully" });
      }

      // Update course total lessons and XP
      await updateCourseStats(courseId);

      setIsAddingLesson(null);
      setEditingLesson(null);
      resetLessonForm();
      fetchLessons(courseId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateCourseStats = async (courseId: string) => {
    // Recalculate course stats from lessons
    const { data: courseLessons } = await supabase
      .from("course_lessons")
      .select("xp_reward")
      .eq("course_id", courseId);

    const totalLessons = courseLessons?.length || 0;
    const totalXp = courseLessons?.reduce((sum, l) => sum + (l.xp_reward || 0), 0) || 0;

    await supabase
      .from("courses")
      .update({ total_lessons: totalLessons, xp_reward: totalXp })
      .eq("id", courseId);

    fetchCourses();
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const { error } = await supabase.from("course_lessons").delete().eq("id", lesson.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Lesson deleted successfully" });
      fetchLessons(lesson.course_id);
      updateCourseStats(lesson.course_id);
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      slug: "",
      description: "",
      category: "web",
      difficulty: "beginner",
      estimated_hours: 10,
      is_published: true,
      is_featured: false,
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      slug: "",
      lesson_order: 1,
      estimated_minutes: 15,
      lesson_type: "theory",
      is_published: true,
    });
    setLessonBlocks([]);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      category: course.category || "web",
      difficulty: course.difficulty || "beginner",
      estimated_hours: course.estimated_hours || 10,
      is_published: course.is_published ?? true,
      is_featured: course.is_featured ?? false,
    });
    setIsAddingCourse(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      slug: lesson.slug,
      lesson_order: lesson.lesson_order,
      estimated_minutes: lesson.estimated_minutes || 15,
      lesson_type: lesson.lesson_type || "theory",
      is_published: lesson.is_published ?? true,
    });
    // Parse blocks from content
    try {
      const blocks = lesson.content ? JSON.parse(lesson.content) : [];
      setLessonBlocks(Array.isArray(blocks) ? blocks : []);
    } catch {
      setLessonBlocks([]);
    }
    setIsAddingLesson(lesson.course_id);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getCategoryColor = (category: string | null) => {
    return CATEGORIES.find((c) => c.value === category)?.color || "bg-slate-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} courses • XP auto-calculated from lessons
          </p>
        </div>
        <Button
          onClick={() => {
            resetCourseForm();
            setEditingCourse(null);
            setIsAddingCourse(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map((course) => (
          <GlassCard key={course.id} className="overflow-hidden" hover={false}>
            {/* Course Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => toggleCourseExpand(course.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${getCategoryColor(course.category)} flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={DIFFICULTIES.find((d) => d.value === course.difficulty)?.color}>
                      {course.difficulty}
                    </Badge>
                    <Badge variant="secondary">
                      <Layers className="w-3 h-3 mr-1" />
                      {course.total_lessons || 0} lessons
                    </Badge>
                    <Badge variant="secondary">
                      <Zap className="w-3 h-3 mr-1" />
                      {course.xp_reward || 0} XP
                    </Badge>
                    {!course.is_published && (
                      <Badge variant="outline" className="text-muted-foreground">Draft</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditCourse(course);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCourse(course.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                {expandedCourse === course.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Lessons List */}
            {expandedCourse === course.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Lessons ({lessons[course.id]?.length || 0})
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        resetLessonForm();
                        setLessonForm((prev) => ({
                          ...prev,
                          lesson_order: (lessons[course.id]?.length || 0) + 1,
                        }));
                        setEditingLesson(null);
                        setIsAddingLesson(course.id);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Lesson
                    </Button>
                  </div>

                  {lessons[course.id]?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {lesson.lesson_order}
                        </span>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium text-foreground">{lesson.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{lesson.estimated_minutes} min</span>
                            <span className="text-xs text-primary">{lesson.xp_reward} XP</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditLesson(lesson)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {lessons[course.id]?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No lessons yet. Add your first lesson!
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No courses yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first course to get started</p>
          <Button onClick={() => setIsAddingCourse(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      )}

      {/* Course Form Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Create New Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => {
                    setCourseForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    }));
                  }}
                  placeholder="Python for Beginners"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="python-for-beginners"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="A comprehensive introduction to Python programming..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={courseForm.category}
                  onValueChange={(value) => setCourseForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={courseForm.difficulty}
                  onValueChange={(value) => setCourseForm((prev) => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Est. Hours</label>
                <Input
                  type="number"
                  value={courseForm.estimated_hours}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, estimated_hours: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={courseForm.is_published}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={courseForm.is_featured}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  className="rounded"
                />
                Featured
              </label>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg text-sm text-muted-foreground">
              <Zap className="w-4 h-4 inline mr-2 text-primary" />
              XP is automatically calculated from lessons. You cannot set it manually.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingCourse(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Form Dialog - Block Editor */}
      <Dialog open={!!isAddingLesson} onOpenChange={() => setIsAddingLesson(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Create New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Lesson Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => {
                    setLessonForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    }));
                  }}
                  placeholder="Introduction to Python"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={lessonForm.lesson_order}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, lesson_order: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  value={lessonForm.estimated_minutes}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, estimated_minutes: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={lessonForm.lesson_type}
                  onValueChange={(value) => setLessonForm((prev) => ({ ...prev, lesson_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="code-along">Code Along</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Block-based Editor */}
            <LessonBlockEditor
              blocks={lessonBlocks}
              onChange={setLessonBlocks}
              onSave={() => handleSaveLesson(isAddingLesson!)}
              isSaving={isSaving}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
