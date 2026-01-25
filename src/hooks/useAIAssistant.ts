import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AIModel } from "@/components/ai/AIModelSelector";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-code-assistant`;

interface UseAIAssistantOptions {
  onError?: (error: string) => void;
  onWarning?: (warning: string) => void;
}

export function useAIAssistant(options?: UseAIAssistantOptions) {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [hasWarning, setHasWarning] = useState(false);

  const saveToHistory = useCallback(
    async (mode: string, input: string, response: string, language: string, model: string) => {
      if (!user) return;

      try {
        const title = input.slice(0, 100) + (input.length > 100 ? "..." : "");
        
        await supabase.from("ai_chat_history").insert({
          user_id: user.id,
          title,
          language,
          messages: [
            { role: "user", content: input, mode, model, timestamp: new Date().toISOString() },
            { role: "assistant", content: response, timestamp: new Date().toISOString() },
          ],
        });
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    },
    [user]
  );

  const processRequest = useCallback(
    async (mode: "generate" | "debug" | "explain", code: string, language: string, model: AIModel = "gemini-3-flash-preview") => {
      if (!code.trim()) return;

      if (!user || !session) {
        options?.onError?.("Please sign in to use the AI Code Assistant.");
        return;
      }

      setIsLoading(true);
      setOutput("");
      setHasWarning(false);

      try {
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ mode, code, language, model }),
        });

        if (!response.ok) {
          let errorMessage = "An error occurred";
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            
            if (errorData.warning) {
              options?.onWarning?.(errorMessage);
              setIsLoading(false);
              return;
            }
          } catch {
            // Response wasn't JSON
          }

          if (response.status === 401) {
            options?.onError?.("Authentication required. Please sign in again.");
          } else if (response.status === 429) {
            options?.onError?.("Rate limit exceeded. Please wait a moment and try again.");
          } else if (response.status === 402) {
            options?.onError?.("AI usage limit reached. Please contact support.");
          } else {
            options?.onError?.(errorMessage);
          }

          setIsLoading(false);
          return;
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullOutput = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullOutput += content;
                setOutput(fullOutput);
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Final flush
        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullOutput += content;
                setOutput(fullOutput);
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Check for uncertainty phrases in response
        const uncertaintyPhrases = [
          "i'm not certain",
          "i'm not sure",
          "please verify",
          "may contain errors",
          "verify before using",
        ];
        
        const hasUncertainty = uncertaintyPhrases.some(phrase => 
          fullOutput.toLowerCase().includes(phrase)
        );
        
        if (hasUncertainty) {
          setHasWarning(true);
        }

        // Save to history after successful response
        if (fullOutput) {
          await saveToHistory(mode, code, fullOutput, language, model);
        }
      } catch (error) {
        console.error("AI Assistant error:", error);
        options?.onError?.(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [user, session, options, saveToHistory]
  );

  const clearOutput = useCallback(() => {
    setOutput("");
    setHasWarning(false);
  }, []);

  return {
    isLoading,
    output,
    hasWarning,
    processRequest,
    clearOutput,
  };
}
