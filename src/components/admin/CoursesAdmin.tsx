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
  X,
  FileText,
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
  { value: "web", label: "Web Development" },
  { value: "python", label: "Python" },
  { value: "ai_ml", label: "AI / Machine Learning" },
  { value: "dsa", label: "Data Structures" },
  { value: "devops", label: "DevOps" },
  { value: "databases", label: "Databases" },
  { value: "cybersecurity", label: "Cybersecurity" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CoursesAdmin() {
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
    xp_reward: 500,
    is_published: true,
    is_featured: false,
  });

  // Lesson form state
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    slug: "",
    content: "",
    lesson_order: 1,
    estimated_minutes: 15,
    xp_reward: 50,
    lesson_type: "theory",
    is_published: true,
  });

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

  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from("courses")
          .update(courseForm)
          .eq("id", editingCourse.id);

        if (error) throw error;
        toast({ title: "Success", description: "Course updated successfully" });
      } else {
        const { error } = await supabase.from("courses").insert(courseForm);
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
      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonForm)
          .eq("id", editingLesson.id);

        if (error) throw error;
        toast({ title: "Success", description: "Lesson updated successfully" });
      } else {
        const { error } = await supabase.from("course_lessons").insert({
          ...lessonForm,
          course_id: courseId,
        });
        if (error) throw error;
        toast({ title: "Success", description: "Lesson created successfully" });

        // Update course total_lessons count
        const count = (lessons[courseId]?.length || 0) + 1;
        await supabase.from("courses").update({ total_lessons: count }).eq("id", courseId);
      }

      setIsAddingLesson(null);
      setEditingLesson(null);
      resetLessonForm();
      fetchLessons(courseId);
      fetchCourses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    const { error } = await supabase.from("course_lessons").delete().eq("id", lesson.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete lesson", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Lesson deleted successfully" });
      fetchLessons(lesson.course_id);
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
      xp_reward: 500,
      is_published: true,
      is_featured: false,
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      slug: "",
      content: "",
      lesson_order: 1,
      estimated_minutes: 15,
      xp_reward: 50,
      lesson_type: "theory",
      is_published: true,
    });
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
      xp_reward: course.xp_reward || 500,
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
      content: lesson.content || "",
      lesson_order: lesson.lesson_order,
      estimated_minutes: lesson.estimated_minutes || 15,
      xp_reward: lesson.xp_reward || 50,
      lesson_type: lesson.lesson_type || "theory",
      is_published: lesson.is_published ?? true,
    });
    setIsAddingLesson(lesson.course_id);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
          <h2 className="text-xl font-semibold text-foreground">Courses</h2>
          <p className="text-sm text-muted-foreground">{courses.length} courses</p>
        </div>
        <Button
          onClick={() => {
            resetCourseForm();
            setEditingCourse(null);
            setIsAddingCourse(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <GlassCard key={course.id} className="overflow-hidden" hover={false}>
            {/* Course Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => toggleCourseExpand(course.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{course.difficulty}</Badge>
                    <Badge variant="outline">{course.total_lessons || 0} lessons</Badge>
                    {!course.is_published && (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditCourse(course);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
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
                      variant="outline"
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
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">
                          {lesson.lesson_order}.
                        </span>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{lesson.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {lesson.estimated_minutes} min
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditLesson(lesson)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {lessons[course.id]?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No lessons yet. Add your first lesson!
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Course Form Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  value={courseForm.estimated_hours}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, estimated_hours: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">XP Reward</label>
                <Input
                  type="number"
                  value={courseForm.xp_reward}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, xp_reward: parseInt(e.target.value) }))}
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

      {/* Lesson Form Dialog */}
      <Dialog open={!!isAddingLesson} onOpenChange={() => setIsAddingLesson(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={lessonForm.slug}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="introduction-to-python"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (Markdown)</label>
              <Textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="# Lesson Title&#10;&#10;Write your lesson content in Markdown..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
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
                <label className="text-sm font-medium">XP Reward</label>
                <Input
                  type="number"
                  value={lessonForm.xp_reward}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, xp_reward: parseInt(e.target.value) }))}
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
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lessonForm.is_published}
                  onChange={(e) => setLessonForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded"
                />
                Published
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingLesson(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSaveLesson(isAddingLesson!)} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
