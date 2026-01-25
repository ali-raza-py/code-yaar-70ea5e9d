import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Language } from "@/components/learning/LanguageSelector";
import type { Level } from "@/components/learning/LevelSelector";
import type { StepContent } from "@/components/learning/RoadmapStep";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`;

interface UseRoadmapGeneratorOptions {
  onError?: (error: string) => void;
}

export function useRoadmapGenerator(options?: UseRoadmapGeneratorOptions) {
  const { session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<StepContent[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateRoadmap = useCallback(
    async (language: Language, level: Level) => {
      if (!session) {
        options?.onError?.("Please sign in to generate a roadmap.");
        return;
      }

      setIsGenerating(true);
      setRoadmap([]);
      setGenerationProgress(0);

      try {
        // Reduced step counts for faster generation
        const stepsCount = level === "beginner" ? 20 : level === "intermediate" ? 15 : 12;
        
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ language, level, stepsCount }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to generate roadmap";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Ignore JSON parse errors
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.roadmap && Array.isArray(data.roadmap)) {
          // Validate and fill in missing content
          const validatedRoadmap: StepContent[] = data.roadmap.map((step: Partial<StepContent>, idx: number) => ({
            id: idx + 1,
            title: step.title || `Step ${idx + 1}`,
            concept: step.concept || "Learn this concept",
            tutorial: step.tutorial || "Tutorial content will be generated...",
            code: step.code || `// Code example for step ${idx + 1}`,
            task: step.task || "Practice this concept",
            whatToLearn: step.whatToLearn || ["Key concept 1", "Key concept 2"],
          }));
          
          setRoadmap(validatedRoadmap);
          setGenerationProgress(100);
        } else {
          throw new Error("Invalid roadmap format received");
        }
      } catch (error) {
        console.error("Roadmap generation error:", error);
        options?.onError?.(error instanceof Error ? error.message : "Failed to generate roadmap");
      } finally {
        setIsGenerating(false);
      }
    },
    [session, options]
  );

  const clearRoadmap = useCallback(() => {
    setRoadmap([]);
    setGenerationProgress(0);
  }, []);

  return {
    isGenerating,
    roadmap,
    generationProgress,
    generateRoadmap,
    clearRoadmap,
  };
}
