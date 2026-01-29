import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Clock, Star, ChevronRight, Award, CheckCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail_url: string | null;
  estimated_hours: number;
  total_lessons: number;
  xp_reward: number;
  is_featured: boolean;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "web", label: "Web Development" },
  { value: "python", label: "Python" },
  { value: "ai_ml", label: "AI / Machine Learning" },
  { value: "dsa", label: "Data Structures" },
  { value: "devops", label: "DevOps" },
  { value: "databases", label: "Databases" },
  { value: "cybersecurity", label: "Cybersecurity" },
];

const DIFFICULTIES = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, categoryFilter, difficultyFilter]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((course) => course.category === categoryFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.difficulty === difficultyFilter
      );
    }

    setFilteredCourses(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Free Courses
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn programming with our comprehensive, free courses. Track your progress and earn XP as you learn.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((diff) => (
                <SelectItem key={diff.value} value={diff.value}>
                  {diff.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <GlassCard className="h-full flex flex-col overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-primary/50" />
                    )}
                    {course.is_featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(course.difficulty)}
                      >
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline" className="bg-secondary/50">
                        {getCategoryLabel(course.category)}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{course.xp_reward} XP</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full group"
                      onClick={() => navigate(`/courses/${course.slug}`)}
                    >
                      Start Course
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No courses found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all" || difficultyFilter !== "all"
                ? "Try adjusting your filters"
                : "Courses are being prepared. Check back soon!"}
            </p>
            {(searchQuery || categoryFilter !== "all" || difficultyFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </GlassCard>
        )}

        {/* Certificate Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Earn Your Certificate
                </h2>
                <p className="text-muted-foreground">
                  Get recognized for your achievements
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Who Gets Certificate */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Certificate Requirements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Complete All Lessons</p>
                      <p className="text-sm text-muted-foreground">
                        Finish 100% of the course lessons to unlock your certificate
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Be a Registered User</p>
                      <p className="text-sm text-muted-foreground">
                        You must have a Code Yaar account to receive certificates
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Automatic Issuance</p>
                      <p className="text-sm text-muted-foreground">
                        Certificate is automatically issued upon course completion
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Verification Info */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Certificate Verification
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-foreground font-medium mb-2">Unique Verification ID</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Each certificate has a unique ID (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">CY-XXXX-XXXX-XXXX</code>) that can be verified by employers or institutions.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-foreground font-medium mb-2">How to Verify</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Anyone can verify a certificate's authenticity using our verification portal.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/verify")}
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Go to Verification Portal
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Features */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">What's Included in Your Certificate</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Your full name</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Course name & details</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Completion dates</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">Unique verification ID</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
