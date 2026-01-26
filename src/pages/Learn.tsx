import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TopAITools } from "@/components/learn/TopAITools";
import { LearnSubsections } from "@/components/learn/LearnSubsections";
import { ResourcesSection } from "@/components/learn/ResourcesSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Lock,
  ArrowRight,
} from "lucide-react";

type ActiveTab = "overview" | "resources";

export default function Learn() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [activeSection, setActiveSection] = useState<string | undefined>();

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId === activeSection ? undefined : sectionId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="font-display text-3xl font-bold mb-4">Sign In to Access Learning Hub</h1>
          <p className="text-muted-foreground mb-6">
            Our learning resources, AI tools, and tutorials are available to registered users. Sign in to explore everything Code-Yaar has to offer.
          </p>
          <Link to="/auth">
            <Button variant="default" size="lg">
              Sign In
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <span className="text-xs font-medium text-primary">Learning Hub</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Learn <span className="text-gradient">Programming</span>
              </h1>
            </div>
          </div>

          <p className="text-muted-foreground text-lg max-w-2xl">
            Master programming with AI-powered tools, structured tutorials, and curated resources.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "resources"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Resources
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <>
            {/* Top AI Tools - Always at the top */}
            <TopAITools />

            {/* Divider */}
            <div className="my-12 border-t border-border" />

            {/* Learning Subsections */}
            <LearnSubsections 
              onSectionSelect={handleSectionSelect}
              activeSection={activeSection}
            />
          </>
        )}

        {activeTab === "resources" && (
          <ResourcesSection />
        )}
      </div>
    </div>
  );
}
