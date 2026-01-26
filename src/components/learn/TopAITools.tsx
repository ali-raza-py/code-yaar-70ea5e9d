import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Code2, 
  Palette, 
  Zap, 
  BookOpen,
  ExternalLink,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AITool {
  id: string;
  name: string;
  description: string | null;
  use_case: string | null;
  category: string;
  url: string | null;
  icon: string | null;
  is_featured: boolean;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  "coding-assistants": { label: "Coding Assistants", icon: Code2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  "web-app-builders": { label: "Web/App Builders", icon: Zap, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  "ai-design": { label: "AI Design Tools", icon: Palette, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  "automation": { label: "Automation & Productivity", icon: Sparkles, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "learning-research": { label: "Learning & Research AI", icon: BookOpen, color: "bg-green-500/10 text-green-600 dark:text-green-400" },
};

const defaultTools: AITool[] = [
  { id: "1", name: "GitHub Copilot", description: "AI pair programmer that helps you write code faster", use_case: "Code completion & generation", category: "coding-assistants", url: "https://github.com/features/copilot", icon: null, is_featured: true },
  { id: "2", name: "Cursor", description: "AI-first code editor built for pair programming with AI", use_case: "Full IDE with AI integration", category: "coding-assistants", url: "https://cursor.sh", icon: null, is_featured: true },
  { id: "3", name: "Lovable", description: "Build full-stack apps with AI in minutes", use_case: "Rapid web app development", category: "web-app-builders", url: "https://lovable.dev", icon: null, is_featured: true },
  { id: "4", name: "v0 by Vercel", description: "Generate UI components with AI", use_case: "UI component generation", category: "web-app-builders", url: "https://v0.dev", icon: null, is_featured: true },
  { id: "5", name: "Midjourney", description: "Create stunning images from text prompts", use_case: "AI art generation", category: "ai-design", url: "https://midjourney.com", icon: null, is_featured: true },
  { id: "6", name: "Figma AI", description: "AI-powered design features in Figma", use_case: "Design assistance", category: "ai-design", url: "https://figma.com", icon: null, is_featured: true },
  { id: "7", name: "Zapier AI", description: "Automate workflows with AI", use_case: "Workflow automation", category: "automation", url: "https://zapier.com", icon: null, is_featured: true },
  { id: "8", name: "Notion AI", description: "AI writing assistant in Notion", use_case: "Note-taking & documentation", category: "automation", url: "https://notion.so", icon: null, is_featured: true },
  { id: "9", name: "Perplexity", description: "AI-powered research assistant", use_case: "Research & learning", category: "learning-research", url: "https://perplexity.ai", icon: null, is_featured: true },
  { id: "10", name: "Claude", description: "Advanced AI assistant for analysis and writing", use_case: "Complex reasoning & writing", category: "learning-research", url: "https://claude.ai", icon: null, is_featured: true },
];

export function TopAITools() {
  const [tools, setTools] = useState<AITool[]>(defaultTools);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      setTools(data);
    }
    setIsLoading(false);
  };

  const filteredTools = activeCategory === "all" 
    ? tools 
    : tools.filter(t => t.category === activeCategory);

  const categories = Object.entries(categoryConfig);

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Top AI Tools</h2>
            <p className="text-sm text-muted-foreground">Essential AI tools for modern developers</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All Tools
          </button>
          {categories.map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const config = categoryConfig[tool.category] || categoryConfig["coding-assistants"];
            const IconComponent = config.icon;
            
            return (
              <div
                key={tool.id}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {tool.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
                
                {tool.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {tool.description}
                  </p>
                )}
                
                {tool.use_case && (
                  <p className="text-xs text-primary/80 mb-3">
                    {tool.use_case}
                  </p>
                )}

                {tool.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => window.open(tool.url!, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Tool
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
