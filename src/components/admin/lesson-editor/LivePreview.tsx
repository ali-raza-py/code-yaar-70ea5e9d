import { useMemo } from "react";
import { Lightbulb, Zap, CheckCircle, ImageIcon } from "lucide-react";
import { CodeBlock as CodeBlockComponent } from "@/components/courses/CodeBlock";
import { OutputBlock as OutputBlockComponent } from "@/components/courses/OutputBlock";
import { MarkdownRenderer } from "@/components/courses/MarkdownRenderer";
import { GlassCard } from "@/components/ui/GlassCard";
import { LessonBlock } from "./BlockTypes";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  blocks: LessonBlock[];
}

export function LivePreview({ blocks }: LivePreviewProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
        <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium">No content yet</p>
        <p className="text-xs mt-1">Add blocks to see the preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-none">
      {blocks.map((block) => (
        <PreviewBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

function PreviewBlock({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "text":
      return <TextPreview block={block} />;
    case "code":
      return <CodePreview block={block} />;
    case "output":
      return <OutputPreview block={block} />;
    case "explanation":
      return <ExplanationPreview block={block} />;
    case "practice":
      return <PracticePreview block={block} />;
    case "image":
      return <ImagePreview block={block} />;
    default:
      return null;
  }
}

function TextPreview({ block }: { block: any }) {
  if (block.heading === "h1") {
    return <h1 className="text-2xl font-bold text-foreground mt-6 mb-3">{block.content || "Untitled"}</h1>;
  }
  if (block.heading === "h2") {
    return <h2 className="text-xl font-semibold text-foreground mt-5 mb-2">{block.content || "Untitled"}</h2>;
  }
  if (block.heading === "h3") {
    return <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{block.content || "Untitled"}</h3>;
  }
  if (!block.content) return null;
  return <MarkdownRenderer content={block.content} />;
}

function CodePreview({ block }: { block: any }) {
  if (!block.code) return <div className="text-xs text-muted-foreground italic p-3 rounded bg-secondary/30">Empty code block</div>;
  return (
    <div>
      {block.title && <div className="text-xs font-medium text-muted-foreground mb-1.5">{block.title}</div>}
      <CodeBlockComponent code={block.code} language={block.language} showLineNumbers={block.showLineNumbers} />
    </div>
  );
}

function OutputPreview({ block }: { block: any }) {
  if (!block.output) return <div className="text-xs text-muted-foreground italic p-3 rounded bg-secondary/30">Empty output block</div>;
  return <OutputBlockComponent output={block.output} />;
}

function ExplanationPreview({ block }: { block: any }) {
  if (!block.content) return null;
  return (
    <GlassCard className="p-4 border-l-4 border-violet-500 bg-violet-500/5">
      <div className="flex gap-3">
        <Lightbulb className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground leading-relaxed">
          <MarkdownRenderer content={block.content} />
        </div>
      </div>
    </GlassCard>
  );
}

function PracticePreview({ block }: { block: any }) {
  return (
    <GlassCard className="p-4 border-l-4 border-rose-500 bg-rose-500/5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-semibold text-foreground">Practice Challenge</span>
        </div>
        <span className="text-xs font-medium text-rose-500">+{block.xpValue} XP</span>
      </div>
      <div className="text-sm text-foreground">
        {block.question ? <MarkdownRenderer content={block.question} /> : <span className="italic text-muted-foreground">No question yet</span>}
      </div>
    </GlassCard>
  );
}

function ImagePreview({ block }: { block: any }) {
  if (!block.url) return <div className="text-xs text-muted-foreground italic p-3 rounded bg-secondary/30">No image URL</div>;
  const widthClass = block.width === "full" ? "w-full" : block.width === "large" ? "max-w-lg" : block.width === "medium" ? "max-w-sm" : "max-w-xs";
  return (
    <figure className="my-2">
      <img
        src={block.url}
        alt={block.alt || ""}
        className={cn("rounded-lg mx-auto", widthClass)}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {block.caption && (
        <figcaption className="text-xs text-center text-muted-foreground mt-2">{block.caption}</figcaption>
      )}
    </figure>
  );
}
