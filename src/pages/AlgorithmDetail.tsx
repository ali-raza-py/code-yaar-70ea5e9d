import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Zap,
  Copy,
  Check,
  BookOpen,
  Code2,
  Play,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/GlassCard";
import DOMPurify from "dompurify";

interface Algorithm {
  id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: string;
  time_complexity: string;
  space_complexity: string;
  explanation: string;
  code_python: string;
  code_cpp: string;
  code_javascript: string;
  practice_links: { name: string; url: string }[];
  category_id: string;
}

interface AlgorithmCategory {
  id: string;
  name: string;
  icon: string;
}

const CODE_OUTPUTS: { [key: string]: string } = {
  "bubble-sort": `Original: [64, 34, 25, 12, 22, 11, 90]
Sorted: [11, 12, 22, 25, 34, 64, 90]`,
  "quick-sort": `Original: [3, 6, 8, 10, 1, 2, 1]
Sorted: [1, 1, 2, 3, 6, 8, 10]`,
  "merge-sort": `Sorted: [3, 9, 10, 27, 38, 43, 82]`,
  "insertion-sort": `Sorted: [5, 6, 11, 12, 13]`,
  "binary-search": `Element found at index: 3`,
  "linear-search": `Element found at index: 3`,
  "fibonacci-dp": `Fib(10) = 55`,
  "factorial-recursion": `0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120`,
  "tower-of-hanoi": `Tower of Hanoi solution for 3 disks:
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C`,
  "lcs": `LCS length: 4`,
  "activity-selection": `Selected activities: [(1, 2), (3, 4), (5, 7), (8, 9)]
Maximum activities: 4`,
  "two-pointers": `'racecar' is palindrome: True
Two sum indices: [1, 3]`,
  "linked-list-basics": `List: [1, 2, 3]`,
  "binary-tree-traversal": `Inorder: 4 2 5 1 3
Preorder: 1 2 4 5 3
Postorder: 4 5 2 3 1`,
  "bfs": `BFS traversal: [0, 1, 2, 3, 4]`,
  "dfs": `DFS recursive: 0 1 2 4 3
DFS iterative: 0 1 2 4 3`,
};

export default function AlgorithmDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [category, setCategory] = useState<AlgorithmCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchAlgorithm();
    }
  }, [slug]);

  useEffect(() => {
    if (user && algorithm) {
      checkBookmark();
    }
  }, [user, algorithm]);

  const fetchAlgorithm = async () => {
    try {
      const { data, error } = await supabase
        .from("algorithms")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      // Parse practice_links if it's a string or JSON
      let practiceLinks: { name: string; url: string }[] = [];
      if (data?.practice_links) {
        if (typeof data.practice_links === "string") {
          practiceLinks = JSON.parse(data.practice_links);
        } else if (Array.isArray(data.practice_links)) {
          practiceLinks = data.practice_links as { name: string; url: string }[];
        }
      }

      setAlgorithm({
        ...data,
        practice_links: practiceLinks,
      } as Algorithm);

      // Fetch category
      if (data?.category_id) {
        const { data: catData } = await supabase
          .from("algorithm_categories")
          .select("*")
          .eq("id", data.category_id)
          .single();
        setCategory(catData);
      }

      // Increment view count
      await supabase
        .from("algorithms")
        .update({ view_count: (data?.view_count || 0) + 1 })
        .eq("id", data?.id);
    } catch (error) {
      console.error("Error fetching algorithm:", error);
      navigate("/algorithms");
    } finally {
      setIsLoading(false);
    }
  };

  const checkBookmark = async () => {
    if (!user || !algorithm) return;

    const { data } = await supabase
      .from("algorithm_bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("algorithm_id", algorithm.id)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!user || !algorithm) {
      toast({
        title: "Login Required",
        description: "Please login to bookmark algorithms.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from("algorithm_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("algorithm_id", algorithm.id);
        setIsBookmarked(false);
        toast({ title: "Bookmark removed" });
      } else {
        await supabase.from("algorithm_bookmarks").insert({
          user_id: user.id,
          algorithm_id: algorithm.id,
        });
        setIsBookmarked(true);
        toast({ title: "Algorithm bookmarked!" });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const markAsComplete = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to track progress.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleted(true);
    toast({
      title: "Marked as Complete! 🎉",
      description: "Great job learning this algorithm!",
    });
  };

  const copyCode = async () => {
    const code = getCodeForLanguage();
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({ title: "Code copied!" });
    }
  };

  const getCodeForLanguage = () => {
    if (!algorithm) return "";
    switch (selectedLanguage) {
      case "python":
        return algorithm.code_python || "";
      case "cpp":
        return algorithm.code_cpp || "";
      case "javascript":
        return algorithm.code_javascript || "";
      default:
        return algorithm.code_python || "";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return "";
    // Simple markdown to HTML conversion
    let html = text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal text-muted-foreground">$2</li>')
      .replace(/\n\n/g, "</p><p class='mb-3 text-muted-foreground'>")
      .replace(/\n/g, "<br/>");
    return DOMPurify.sanitize(`<p class='mb-3 text-muted-foreground'>${html}</p>`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!algorithm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Algorithm Not Found</h2>
          <Button onClick={() => navigate("/algorithms")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>
        </div>
      </div>
    );
  }

  const output = CODE_OUTPUTS[algorithm.slug] || "// Run the code to see output";

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button & Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/algorithms")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {category && (
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <span>{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {algorithm.name}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {algorithm.description}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={toggleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
              <Button
                variant={isCompleted ? "default" : "outline"}
                size="sm"
                onClick={markAsComplete}
                disabled={isCompleted}
                className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isCompleted ? "Completed" : "Mark Complete"}
              </Button>
            </div>
          </div>

          {/* Complexity Badges */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge variant="outline" className={getDifficultyColor(algorithm.difficulty)}>
              {algorithm.difficulty}
            </Badge>
            {algorithm.time_complexity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time: {algorithm.time_complexity}
              </Badge>
            )}
            {algorithm.space_complexity && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Space: {algorithm.space_complexity}
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-8">
          {/* Explanation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Explanation</h2>
              </div>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(algorithm.explanation || "") }}
              />
            </GlassCard>
          </motion.div>

          {/* Code Snippet Section - Programiz Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Code Implementation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                    className="w-auto"
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="python" className="text-xs px-3 h-7">
                        Python
                      </TabsTrigger>
                      <TabsTrigger value="cpp" className="text-xs px-3 h-7">
                        C++
                      </TabsTrigger>
                      <TabsTrigger value="javascript" className="text-xs px-3 h-7">
                        JavaScript
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCode}
                    className="h-8"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Code Block */}
              <div className="relative">
                <pre className="p-4 md:p-6 bg-[#1e1e1e] text-gray-100 overflow-x-auto text-sm leading-relaxed font-mono">
                  <code>{getCodeForLanguage()}</code>
                </pre>
              </div>
            </GlassCard>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border-b border-green-500/20">
                <Play className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground">Output</span>
              </div>
              <pre className="p-4 md:p-6 bg-[#0d1117] text-green-400 font-mono text-sm overflow-x-auto">
                {output}
              </pre>
            </GlassCard>
          </motion.div>

          {/* Practice Section */}
          {algorithm.practice_links && algorithm.practice_links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Practice Problems</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Test your understanding with these practice problems:
                </p>
                <div className="flex flex-wrap gap-3">
                  {algorithm.practice_links.map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {link.name}
                    </Button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}