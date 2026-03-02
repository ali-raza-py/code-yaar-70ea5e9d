import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Zap, CheckCircle } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { OutputBlock } from "./OutputBlock";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

// Block types matching the admin editor
interface TextBlock { type: "text"; id: string; content: string; heading?: "h1" | "h2" | "h3" | "paragraph"; }
interface CodeBlockType { type: "code"; id: string; language: string; code: string; title?: string; showLineNumbers?: boolean; }
interface OutputBlockType { type: "output"; id: string; output: string; linkedCodeBlockId?: string; }
interface ExplanationBlock { type: "explanation"; id: string; content: string; }
interface PracticeBlock { type: "practice"; id: string; question: string; expectedOutput?: string; validationRule?: string; xpValue: number; hints?: string[]; }
interface ImageBlock { type: "image"; id: string; url: string; alt: string; caption?: string; width?: "full" | "large" | "medium" | "small"; }

type LessonBlock = TextBlock | CodeBlockType | OutputBlockType | ExplanationBlock | PracticeBlock | ImageBlock;

interface BlockContentRendererProps {
  content: string;
  onPracticeComplete?: (blockId: string, isCorrect: boolean) => void;
  completedPractices?: string[];
}

export function BlockContentRenderer({ content, onPracticeComplete, completedPractices = [] }: BlockContentRendererProps) {
  const blocks = useMemo(() => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? (parsed as LessonBlock[]) : null;
    } catch {
      return null;
    }
  }, [content]);

  if (!blocks) return <LegacyMarkdownRenderer content={content} />;

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => (
        <motion.div key={block.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
          <BlockComponent block={block} onPracticeComplete={onPracticeComplete} isCompleted={completedPractices.includes(block.id)} />
        </motion.div>
      ))}
    </div>
  );
}

function BlockComponent({ block, onPracticeComplete, isCompleted }: { block: LessonBlock; onPracticeComplete?: (id: string, ok: boolean) => void; isCompleted?: boolean }) {
  switch (block.type) {
    case "text": return <TextBlockRenderer block={block} />;
    case "code": return <CodeBlockRenderer block={block} />;
    case "output": return <OutputBlockRenderer block={block} />;
    case "explanation": return <ExplanationBlockRenderer block={block} />;
    case "practice": return <PracticeBlockRenderer block={block} onComplete={onPracticeComplete} isCompleted={isCompleted} />;
    case "image": return <ImageBlockRenderer block={block} />;
    default: return null;
  }
}

function TextBlockRenderer({ block }: { block: TextBlock }) {
  const headingClasses = {
    h1: "text-3xl font-bold text-foreground mt-8 mb-4",
    h2: "text-2xl font-semibold text-foreground mt-6 mb-3",
    h3: "text-xl font-medium text-foreground mt-4 mb-2",
    paragraph: "",
  };
  if (block.heading === "paragraph" || !block.heading) return <MarkdownRenderer content={block.content} />;
  const Tag = block.heading as "h1" | "h2" | "h3";
  return <Tag className={headingClasses[block.heading]}>{block.content}</Tag>;
}

function CodeBlockRenderer({ block }: { block: CodeBlockType }) {
  return (
    <div className="my-4">
      {block.title && <div className="text-sm font-medium text-muted-foreground mb-2">{block.title}</div>}
      <CodeBlock code={block.code} language={block.language} showLineNumbers={block.showLineNumbers} />
    </div>
  );
}

function OutputBlockRenderer({ block }: { block: OutputBlockType }) {
  return <div className="my-4"><OutputBlock output={block.output} /></div>;
}

function ExplanationBlockRenderer({ block }: { block: ExplanationBlock }) {
  return (
    <GlassCard className="p-4 border-l-4 border-violet-500 bg-violet-500/5 my-4">
      <div className="flex gap-3">
        <Lightbulb className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
        <div className="text-muted-foreground leading-relaxed"><MarkdownRenderer content={block.content} /></div>
      </div>
    </GlassCard>
  );
}

function PracticeBlockRenderer({ block, onComplete, isCompleted }: { block: PracticeBlock; onComplete?: (id: string, ok: boolean) => void; isCompleted?: boolean }) {
  return (
    <GlassCard className={cn("p-5 border-l-4 my-6", isCompleted ? "border-emerald-500 bg-emerald-500/5" : "border-rose-500 bg-rose-500/5")}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Zap className={cn("w-5 h-5", isCompleted ? "text-emerald-500" : "text-rose-500")} />
          <span className="font-semibold text-foreground">Practice Challenge</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          <span className={cn("font-medium", isCompleted ? "text-emerald-500" : "text-rose-500")}>+{block.xpValue} XP</span>
        </div>
      </div>
      <div className="text-foreground mb-4"><MarkdownRenderer content={block.question} /></div>
      {block.hints && block.hints.length > 0 && (
        <div className="text-sm text-muted-foreground mt-3 p-3 rounded-lg bg-secondary/30">
          <strong>Hints:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">{block.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </div>
      )}
    </GlassCard>
  );
}

function ImageBlockRenderer({ block }: { block: ImageBlock }) {
  if (!block.url) return null;
  const widthClass = block.width === "full" ? "w-full" : block.width === "large" ? "max-w-lg" : block.width === "medium" ? "max-w-sm" : "max-w-xs";
  return (
    <figure className="my-6">
      <img src={block.url} alt={block.alt || ""} className={cn("rounded-lg mx-auto", widthClass)} />
      {block.caption && <figcaption className="text-sm text-center text-muted-foreground mt-2">{block.caption}</figcaption>}
    </figure>
  );
}

function LegacyMarkdownRenderer({ content }: { content: string }) {
  const parts: JSX.Element[] = [];
  let key = 0;
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const outputBlockRegex = /\*\*Output:\*\*\n```\n([\s\S]*?)```/g;
  let processedContent = content.replace(outputBlockRegex, (_, output) => `__OUTPUT_BLOCK_${key++}__${output}__END_OUTPUT_BLOCK__`);
  processedContent = processedContent.replace(codeBlockRegex, (_, lang, code) => `__CODE_BLOCK_${key++}__${lang || "text"}__${code.trim()}__END_CODE_BLOCK__`);
  const segments = processedContent.split(/(__CODE_BLOCK_\d+__|__OUTPUT_BLOCK_\d+__)/);
  segments.forEach((segment, index) => {
    if (segment.startsWith("__CODE_BLOCK_")) {
      const match = segment.match(/__CODE_BLOCK_(\d+)__(\w+)__(.*)__END_CODE_BLOCK__/s);
      if (match) parts.push(<CodeBlock key={`code-${index}`} code={match[3]} language={match[2]} />);
    } else if (segment.startsWith("__OUTPUT_BLOCK_")) {
      const match = segment.match(/__OUTPUT_BLOCK_\d+__([\s\S]*)__END_OUTPUT_BLOCK__/);
      if (match) parts.push(<OutputBlock key={`output-${index}`} output={match[1].trim()} />);
    } else if (segment.trim()) {
      parts.push(<MarkdownRenderer key={`md-${index}`} content={segment} />);
    }
  });
  return <div className="space-y-4">{parts}</div>;
}
