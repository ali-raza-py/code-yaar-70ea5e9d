import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, Trash2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DOMPurify from "dompurify";
import type { Language } from "./LanguageSelector";
import type { StepContent } from "./RoadmapStep";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LearningAssistantProps {
  language: Language;
  currentStep: StepContent | null;
  userCode: string;
  onSendMessage: (message: string) => Promise<string>;
  isLoading: boolean;
}

const quickPrompts = [
  { icon: "🔄", text: "Explain this simpler" },
  { icon: "📝", text: "Show me an example" },
  { icon: "❓", text: "Why does this work?" },
  { icon: "💡", text: "What's the best practice?" },
];

export function LearningAssistant({ language, currentStep, userCode, onSendMessage, isLoading }: LearningAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await onSendMessage(text);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const formatContent = (content: string) => {
    let formatted = content;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary">$1</code>');
    formatted = formatted.replace(/\n/g, "<br />");
    return DOMPurify.sanitize(formatted);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold">Learning Assistant</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Context Info */}
      {(currentStep || userCode) && (
        <div className="px-4 py-2 bg-muted/50 border-b border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3 h-3" />
            <span>
              Context: {language.toUpperCase()}
              {currentStep && ` • Step ${currentStep.id}: ${currentStep.title}`}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">I'm your coding mentor!</p>
            <p className="text-sm">Ask me anything about the current step, your code, or programming concepts.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => handleSend(prompt.text)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {prompt.icon} {prompt.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about this concept..."
            className="min-h-[60px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-auto"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
