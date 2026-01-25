import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Language } from "@/components/learning/LanguageSelector";
import type { StepContent } from "@/components/learning/RoadmapStep";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learning-assistant`;

interface UseLearningAssistantOptions {
  onError?: (error: string) => void;
}

export function useLearningAssistant(options?: UseLearningAssistantOptions) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (
      message: string,
      language: Language,
      currentStep: StepContent | null,
      userCode: string
    ): Promise<string> => {
      if (!session) {
        options?.onError?.("Please sign in to use the Learning Assistant.");
        throw new Error("Not authenticated");
      }

      setIsLoading(true);

      try {
        const context = {
          language,
          stepTitle: currentStep?.title,
          stepConcept: currentStep?.concept,
          stepTutorial: currentStep?.tutorial,
          userCode: userCode.slice(0, 2000), // Limit code context
        };

        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message, context }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to get response");
        }

        const data = await response.json();
        return data.response || "I couldn't generate a response. Please try again.";
      } catch (error) {
        console.error("Learning assistant error:", error);
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        options?.onError?.(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [session, options]
  );

  return {
    isLoading,
    sendMessage,
  };
}
