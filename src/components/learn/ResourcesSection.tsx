import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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

export function ResourcesSection() {
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
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "advanced":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
        <p className="text-muted-foreground mb-4">
          Resources are available to registered users only.
        </p>
        <Link to="/auth">
          <Button variant="default">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Resources
        </h2>
        <p className="text-muted-foreground">
          Docs, cheat sheets, and recommended tools
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Resources Found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterType !== "all" || filterDifficulty !== "all"
              ? "Try adjusting your search or filters."
              : "Check back soon for new learning materials!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all hover:shadow-lg group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {resource.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary capitalize">
                      {resource.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty || "General"}
                    </span>
                  </div>
                </div>
              </div>

              {resource.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {resource.description}
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

      {filteredResources.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredResources.length} of {resources.length} resources
          </p>
        </div>
      )}
    </section>
  );
}
