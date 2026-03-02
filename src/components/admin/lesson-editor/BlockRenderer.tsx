import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Code,
  Terminal,
  MessageSquare,
  Zap,
  Link,
  ImageIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LessonBlock, LANGUAGES, CodeBlock as CodeBlockType } from "./BlockTypes";
import { cn } from "@/lib/utils";

interface BlockRendererProps {
  block: LessonBlock;
  index: number;
  totalBlocks: number;
  codeBlocks: CodeBlockType[];
  onUpdate: (block: LessonBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  dragHandleProps?: Record<string, any>;
}

const BLOCK_META: Record<string, { icon: React.ReactNode; label: string; accent: string }> = {
  text: { icon: <FileText className="w-3.5 h-3.5" />, label: "Text", accent: "text-blue-500 border-blue-500/20 bg-blue-500/5" },
  code: { icon: <Code className="w-3.5 h-3.5" />, label: "Code", accent: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" },
  output: { icon: <Terminal className="w-3.5 h-3.5" />, label: "Output", accent: "text-amber-500 border-amber-500/20 bg-amber-500/5" },
  explanation: { icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Explanation", accent: "text-violet-500 border-violet-500/20 bg-violet-500/5" },
  practice: { icon: <Zap className="w-3.5 h-3.5" />, label: "Practice", accent: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
  image: { icon: <ImageIcon className="w-3.5 h-3.5" />, label: "Image", accent: "text-cyan-500 border-cyan-500/20 bg-cyan-500/5" },
};

export function BlockRenderer({
  block,
  index,
  totalBlocks,
  codeBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  dragHandleProps,
}: BlockRendererProps) {
  const meta = BLOCK_META[block.type];
  const accentParts = meta.accent.split(" ");
  const borderAccent = accentParts[1];
  const bgAccent = accentParts[2];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group rounded-lg border bg-card transition-shadow hover:shadow-soft",
        borderAccent
      )}
    >
      {/* Compact header */}
      <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-border/40", bgAccent)}>
        <div
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-secondary/50 transition-colors"
          {...dragHandleProps}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", accentParts[0])}>
          {meta.icon}
          {meta.label}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">#{index + 1}</span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} disabled={index === 0}>
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} disabled={index === totalBlocks - 1}>
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Block content */}
      <div className="p-3">
        {block.type === "text" && <TextEditor block={block} onUpdate={onUpdate} />}
        {block.type === "code" && <CodeEditor block={block} onUpdate={onUpdate} />}
        {block.type === "output" && <OutputEditor block={block} onUpdate={onUpdate} codeBlocks={codeBlocks} />}
        {block.type === "explanation" && <ExplanationEditor block={block} onUpdate={onUpdate} />}
        {block.type === "practice" && <PracticeEditor block={block} onUpdate={onUpdate} />}
        {block.type === "image" && <ImageEditor block={block} onUpdate={onUpdate} />}
      </div>
    </motion.div>
  );
}

function TextEditor({ block, onUpdate }: { block: any; onUpdate: (b: any) => void }) {
  return (
    <div className="space-y-2">
      <Select value={block.heading || "paragraph"} onValueChange={(v) => onUpdate({ ...block, heading: v })}>
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
          <SelectItem value="paragraph">Paragraph</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        value={block.content}
        onChange={(e) => onUpdate({ ...block, content: e.target.value })}
        placeholder={block.heading === "paragraph" || !block.heading ? "Write your content… (supports **bold**, *italic*, `code`)" : "Enter heading text…"}
        rows={block.heading === "paragraph" || !block.heading ? 3 : 1}
        className="bg-background/50 text-sm resize-none"
      />
    </div>
  );
}

function CodeEditor({ block, onUpdate }: { block: any; onUpdate: (b: any) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={block.language} onValueChange={(v) => onUpdate({ ...block, language: v })}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={block.title || ""}
          onChange={(e) => onUpdate({ ...block, title: e.target.value })}
          placeholder="Title (optional)"
          className="flex-1 h-8 text-xs bg-background/50"
        />
      </div>
      <Textarea
        value={block.code}
        onChange={(e) => onUpdate({ ...block, code: e.target.value })}
        placeholder="// Write your code here…"
        rows={8}
        className="font-mono text-xs leading-relaxed bg-[hsl(var(--code-bg))] text-[hsl(var(--code-text))] border-border/30 resize-none"
      />
    </div>
  );
}

function OutputEditor({ block, onUpdate, codeBlocks }: { block: any; onUpdate: (b: any) => void; codeBlocks: CodeBlockType[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link className="w-3.5 h-3.5 text-muted-foreground" />
        <Select value={block.linkedCodeBlockId || "none"} onValueChange={(v) => onUpdate({ ...block, linkedCodeBlockId: v === "none" ? undefined : v })}>
          <SelectTrigger className="w-56 h-8 text-xs">
            <SelectValue placeholder="Link to code block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No link</SelectItem>
            {codeBlocks.map((cb, idx) => (
              <SelectItem key={cb.id} value={cb.id}>Code #{idx + 1} – {cb.title || cb.language}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        value={block.output}
        onChange={(e) => onUpdate({ ...block, output: e.target.value })}
        placeholder="Expected output…"
        rows={3}
        className="font-mono text-xs bg-[hsl(var(--code-bg))] text-amber-400 border-border/30 resize-none"
      />
    </div>
  );
}

function ExplanationEditor({ block, onUpdate }: { block: any; onUpdate: (b: any) => void }) {
  return (
    <Textarea
      value={block.content}
      onChange={(e) => onUpdate({ ...block, content: e.target.value })}
      placeholder="Explain the concept…"
      rows={3}
      className="bg-background/50 text-sm resize-none"
    />
  );
}

function PracticeEditor({ block, onUpdate }: { block: any; onUpdate: (b: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
        <Textarea
          value={block.question}
          onChange={(e) => onUpdate({ ...block, question: e.target.value })}
          placeholder="Write the practice question…"
          rows={2}
          className="bg-background/50 text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Expected Output</label>
          <Textarea
            value={block.expectedOutput || ""}
            onChange={(e) => onUpdate({ ...block, expectedOutput: e.target.value })}
            placeholder="Expected answer…"
            rows={2}
            className="font-mono text-xs bg-[hsl(var(--code-bg))] text-emerald-400 border-border/30 resize-none"
          />
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">XP Reward</label>
            <Input
              type="number"
              value={block.xpValue}
              onChange={(e) => onUpdate({ ...block, xpValue: parseInt(e.target.value) || 0 })}
              min={0}
              className="h-8 text-xs bg-background/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Validation Rule</label>
            <Input
              value={block.validationRule || ""}
              onChange={(e) => onUpdate({ ...block, validationRule: e.target.value })}
              placeholder="regex or exact"
              className="h-8 font-mono text-xs bg-background/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageEditor({ block, onUpdate }: { block: any; onUpdate: (b: any) => void }) {
  return (
    <div className="space-y-2">
      <Input
        value={block.url}
        onChange={(e) => onUpdate({ ...block, url: e.target.value })}
        placeholder="Image URL (paste link or upload)"
        className="h-8 text-xs bg-background/50"
      />
      <div className="flex gap-2">
        <Input
          value={block.alt}
          onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
          placeholder="Alt text"
          className="flex-1 h-8 text-xs bg-background/50"
        />
        <Select value={block.width || "large"} onValueChange={(v) => onUpdate({ ...block, width: v })}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full width</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="small">Small</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Input
        value={block.caption || ""}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="h-8 text-xs bg-background/50"
      />
      {block.url && (
        <div className="rounded-lg overflow-hidden border border-border/40 bg-secondary/20 p-2">
          <img
            src={block.url}
            alt={block.alt || "Preview"}
            className={cn(
              "rounded object-cover mx-auto",
              block.width === "full" ? "w-full" : block.width === "large" ? "max-w-lg" : block.width === "medium" ? "max-w-sm" : "max-w-xs"
            )}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
    </div>
  );
}
