import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  BookOpen, 
  Code2, 
  FileText, 
  Target, 
  TrendingUp, 
  Bell,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Subsection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  count?: number;
  link?: string;
}

const subsections: Subsection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Basics, setup guides, prerequisites to begin your coding journey",
    icon: Rocket,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    count: 12,
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    description: "Step-by-step lessons with examples covering fundamentals",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    count: 24,
  },
  {
    id: "tutorials",
    title: "Tutorials & Guides",
    description: "Project-based tutorials and code walkthroughs",
    icon: Code2,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    count: 18,
  },
  {
    id: "resources",
    title: "Resources",
    description: "Docs, cheat sheets, recommended tools and libraries",
    icon: FileText,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    count: 35,
    link: "/learn?tab=resources",
  },
  {
    id: "practice",
    title: "Practice & Projects",
    description: "Exercises, mini projects, and real-world applications",
    icon: Target,
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    count: 15,
  },
  {
    id: "advanced",
    title: "Advanced Topics",
    description: "Optimization, best practices, industry-level concepts",
    icon: TrendingUp,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    count: 10,
  },
  {
    id: "updates",
    title: "Updates & New Content",
    description: "Latest lessons and newly added tools and resources",
    icon: Bell,
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    count: 5,
  },
];

interface LearnSubsectionsProps {
  onSectionSelect?: (sectionId: string) => void;
  activeSection?: string;
}

export function LearnSubsections({ onSectionSelect, activeSection }: LearnSubsectionsProps) {
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Learning Paths
        </h2>
        <p className="text-muted-foreground">
          Structured content to guide your programming journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsections.map((section) => {
          const IconComponent = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionSelect?.(section.id)}
              className={`group p-5 rounded-xl text-left transition-all hover:shadow-lg ${
                isActive 
                  ? "bg-primary/10 border-2 border-primary" 
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${section.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {section.title}
                    </h3>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-all ${isActive ? "text-primary" : ""}`} />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {section.description}
                  </p>
                  {section.count && (
                    <span className="text-xs text-primary font-medium">
                      {section.count} items
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
