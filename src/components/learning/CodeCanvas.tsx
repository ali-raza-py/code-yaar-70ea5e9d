import { useState, useRef, useEffect } from "react";
import { Play, Bug, Sparkles, Loader2, Copy, Check, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Language } from "./LanguageSelector";

interface CodeCanvasProps {
  initialCode?: string;
  language: Language;
  onAskAssistant: (code: string, action: "run" | "debug" | "explain") => void;
  isLoading: boolean;
  output: string;
}

export function CodeCanvas({ initialCode = "", language, onAskAssistant, isLoading, output }: CodeCanvasProps) {
  const [code, setCode] = useState(initialCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (outputRef.current && isLoading) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isLoading]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
  };

  const languageLabels: Record<Language, string> = {
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    java: "Java",
    csharp: "C#",
    cpp: "C++",
    c: "C",
    go: "Go",
    rust: "Rust",
    sql: "SQL",
    html: "HTML/CSS",
  };

  return (
    <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-background p-4" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          <h2 className="font-display text-xl font-bold">Code Canvas</h2>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
            {languageLabels[language]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className={`grid ${isFullscreen ? "grid-cols-2 gap-4 flex-1" : "gap-4"}`}>
        {/* Editor Section */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write or paste your code here..."
              className={`font-mono text-sm bg-code text-code-text border-border resize-none ${
                isFullscreen ? "h-[calc(100vh-200px)]" : "min-h-[300px]"
              }`}
            />
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-primary/50" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => onAskAssistant(code, "run")}
              disabled={!code.trim() || isLoading}
              className="flex-1"
              variant="default"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Run & Explain
            </Button>
            <Button
              onClick={() => onAskAssistant(code, "debug")}
              disabled={!code.trim() || isLoading}
              variant="outline"
              className="flex-1"
            >
              <Bug className="w-4 h-4 mr-2" />
              Debug
            </Button>
            <Button
              onClick={() => onAskAssistant(code, "explain")}
              disabled={!code.trim() || isLoading}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fix & Improve
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Debug Output
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </div>
          <div
            ref={outputRef}
            className={`p-4 rounded-lg bg-code border border-border overflow-auto font-mono text-sm ${
              isFullscreen ? "h-[calc(100vh-180px)]" : "min-h-[250px] max-h-[400px]"
            }`}
          >
            {output ? (
              <pre className="text-code-text whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-code-comment italic">
                Output will appear here when you run, debug, or improve your code...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
