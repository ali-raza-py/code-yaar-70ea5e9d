import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Search,
  Loader2,
  ExternalLink,
  Download,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  url: string | null;
  file_path: string | null;
  difficulty: string | null;
  language: string | null;
  is_published: boolean;
  created_at: string;
}

export default function Learn() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchResources();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchResources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
    } else {
      setResources(data || []);
    }
    setIsLoading(false);
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesDifficulty = filterDifficulty === "all" || r.difficulty === filterDifficulty;
    const matchesLanguage = filterLanguage === "all" || r.language === filterLanguage;
    return matchesSearch && matchesType && matchesDifficulty && matchesLanguage;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5 text-primary" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-primary" />;
      default:
        return <BookOpen className="w-5 h-5 text-primary" />;
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-500";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-500";
      case "advanced":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="font-display text-3xl font-bold mb-4">Sign In to Access Resources</h1>
          <p className="text-muted-foreground mb-6">
            Our learning resources are available to registered users. Sign in to explore tutorials, videos, and more.
          </p>
          <Link to="/auth">
            <Button variant="default" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Learning Hub</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Learn <span className="text-gradient">Programming</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Explore tutorials, videos, and resources to boost your coding skills.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Languages</option>
              <option value="python">🐍 Python</option>
              <option value="cpp">⚡ C++</option>
              <option value="c">🔧 C</option>
              <option value="javascript">🟨 JavaScript</option>
              <option value="typescript">🔷 TypeScript</option>
              <option value="java">☕ Java</option>
              <option value="go">🐹 Go</option>
              <option value="rust">🦀 Rust</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Types</option>
              <option value="tutorial">Tutorials</option>
              <option value="video">Videos</option>
              <option value="pdf">PDFs</option>
              <option value="article">Articles</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Resources Found</h2>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== "all" || filterDifficulty !== "all"
                ? "Try adjusting your search or filters."
                : "Check back soon for new learning materials!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary capitalize">
                        {resource.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded capitalize ${getDifficultyColor(
                          resource.difficulty
                        )}`}
                      >
                        {resource.difficulty || "General"}
                      </span>
                      {resource.language && resource.language !== "general" && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">
                          {resource.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                {resource.category && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Category: <span className="text-foreground capitalize">{resource.category}</span>
                  </p>
                )}

                {resource.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => window.open(resource.url!, "_blank")}
                  >
                    {resource.file_path ? (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Open Resource
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredResources.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
