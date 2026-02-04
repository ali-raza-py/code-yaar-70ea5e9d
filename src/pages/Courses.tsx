import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Clock, Star, ChevronRight, Award, CheckCircle, ShieldCheck, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

// Language/Course icons with colorful styling like Programiz
const LANGUAGE_COURSES = [
  { id: "python", name: "Python", icon: "🐍", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  { id: "sql", name: "SQL", icon: "🗃️", color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  { id: "r", name: "R", icon: "📊", color: "from-blue-400 to-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-500" },
  { id: "html", name: "HTML", icon: "🌐", color: "from-orange-500 to-red-500", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  { id: "css", name: "CSS", icon: "🎨", color: "from-blue-500 to-purple-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "from-yellow-400 to-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
  { id: "typescript", name: "TypeScript", icon: "📘", color: "from-blue-600 to-blue-700", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  { id: "java", name: "Java", icon: "☕", color: "from-red-500 to-red-600", bgColor: "bg-red-50", textColor: "text-red-600" },
  { id: "c", name: "C", icon: "⚙️", color: "from-gray-600 to-gray-700", bgColor: "bg-gray-50", textColor: "text-gray-700" },
  { id: "cpp", name: "C++", icon: "🔧", color: "from-blue-600 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  { id: "csharp", name: "C#", icon: "💜", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  { id: "go", name: "Go", icon: "🐹", color: "from-cyan-500 to-cyan-600", bgColor: "bg-cyan-50", textColor: "text-cyan-600" },
  { id: "kotlin", name: "Kotlin", icon: "🎯", color: "from-purple-500 to-orange-500", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  { id: "swift", name: "Swift", icon: "🍎", color: "from-orange-500 to-red-500", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  { id: "dsa", name: "DSA", icon: "🧮", color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", textColor: "text-emerald-600" },
  { id: "numpy", name: "NumPy", icon: "🔢", color: "from-blue-500 to-cyan-500", bgColor: "bg-cyan-50", textColor: "text-cyan-600" },
  { id: "pandas", name: "Pandas", icon: "🐼", color: "from-blue-600 to-blue-700", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  { id: "rust", name: "Rust", icon: "🦀", color: "from-orange-600 to-red-600", bgColor: "bg-orange-50", textColor: "text-orange-700" },
];

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const filteredLanguages = LANGUAGE_COURSES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Learn programming for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">free</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Master any programming language with our comprehensive, beginner-friendly courses.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tutorials & examples"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-full border-slate-200 focus:border-blue-500"
            />
          </div>
        </motion.div>
      </div>

      {/* Language Grid - Programiz Style */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {filteredLanguages.map((lang, index) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const course = courses.find(c => 
                  c.category?.toLowerCase() === lang.id || 
                  c.title.toLowerCase().includes(lang.name.toLowerCase())
                );
                if (course) {
                  navigate(`/courses/${course.slug}`);
                } else {
                  navigate(`/courses?category=${lang.id}`);
                }
              }}
              className={`${lang.bgColor} border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:shadow-lg hover:border-slate-300 transition-all duration-200 text-left group`}
            >
              <span className="text-2xl">{lang.icon}</span>
              <span className={`font-semibold ${lang.textColor}`}>{lang.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Pro Section */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-bold text-slate-800">Code-Yaar</span>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              PRO
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Your builder path starts here.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Get access to premium courses, projects, and career support to accelerate your learning journey.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
          >
            Explore Pro Features
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Available Courses */}
      {courses.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Available Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <GlassCard className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Thumbnail */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-blue-500/50" />
                      )}
                      {course.is_featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
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
                          className={
                            course.difficulty === "beginner"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : course.difficulty === "intermediate"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }
                        >
                          {course.difficulty}
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
                          <Star className="w-4 h-4 text-amber-500" />
                          <span>{course.xp_reward} XP</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          </motion.div>
        </div>
      )}

      {/* Certificate Information Section */}
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20">
                <Award className="w-8 h-8 text-amber-600" />
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
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Certificate Requirements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Complete All Lessons</p>
                      <p className="text-sm text-muted-foreground">
                        Finish 100% of the course lessons to unlock your certificate
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Be a Registered User</p>
                      <p className="text-sm text-muted-foreground">
                        You must have a Code-Yaar account to receive certificates
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">3</span>
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
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  Certificate Verification
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                    <p className="text-foreground font-medium mb-2">Unique Verification ID</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Each certificate has a unique ID (e.g., <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border">CY-XXXX-XXXX-XXXX</code>) that can be verified by employers or institutions.
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Your full name</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Course name & details</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">Completion dates</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                  <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
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
