import { useState } from "react";
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
}

export function BlockRenderer({
  block,
  index,
  totalBlocks,
  codeBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: BlockRendererProps) {
  const getBlockIcon = () => {
    switch (block.type) {
      case "text":
        return <FileText className="w-4 h-4" />;
      case "code":
        return <Code className="w-4 h-4" />;
      case "output":
        return <Terminal className="w-4 h-4" />;
      case "explanation":
        return <MessageSquare className="w-4 h-4" />;
      case "practice":
        return <Zap className="w-4 h-4" />;
    }
  };

  const getBlockColor = () => {
    switch (block.type) {
      case "text":
        return "border-blue-500/30 bg-blue-500/5";
      case "code":
        return "border-emerald-500/30 bg-emerald-500/5";
      case "output":
        return "border-amber-500/30 bg-amber-500/5";
      case "explanation":
        return "border-violet-500/30 bg-violet-500/5";
      case "practice":
        return "border-rose-500/30 bg-rose-500/5";
    }
  };

  const getBlockLabel = () => {
    switch (block.type) {
      case "text":
        return "Text";
      case "code":
        return "Code";
      case "output":
        return "Output";
      case "explanation":
        return "Explanation";
      case "practice":
        return "Practice";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("border rounded-xl overflow-hidden", getBlockColor())}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border/50">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <div className="flex items-center gap-2">
            {getBlockIcon()}
            <span className="text-sm font-medium">{getBlockLabel()}</span>
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={index === totalBlocks - 1}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4">
        {block.type === "text" && (
          <div className="space-y-3">
            <Select
              value={block.heading || "paragraph"}
              onValueChange={(value) =>
                onUpdate({ ...block, heading: value as any })
              }
            >
              <SelectTrigger className="w-40">
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
              placeholder="Enter your text content..."
              rows={4}
              className="bg-background"
            />
          </div>
        )}

        {block.type === "code" && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Select
                value={block.language}
                onValueChange={(value) =>
                  onUpdate({ ...block, language: value as any })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={block.title || ""}
                onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                placeholder="Block title (optional)"
                className="flex-1 bg-background"
              />
            </div>
            <Textarea
              value={block.code}
              onChange={(e) => onUpdate({ ...block, code: e.target.value })}
              placeholder="// Write your code here..."
              rows={10}
              className="font-mono text-sm bg-slate-900 text-emerald-400 border-slate-700"
            />
          </div>
        )}

        {block.type === "output" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-muted-foreground" />
              <Select
                value={block.linkedCodeBlockId || "none"}
                onValueChange={(value) =>
                  onUpdate({
                    ...block,
                    linkedCodeBlockId: value === "none" ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Link to code block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No link</SelectItem>
                  {codeBlocks.map((cb, idx) => (
                    <SelectItem key={cb.id} value={cb.id}>
                      Code Block #{idx + 1} - {cb.title || cb.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={block.output}
              onChange={(e) => onUpdate({ ...block, output: e.target.value })}
              placeholder="Expected output..."
              rows={4}
              className="font-mono text-sm bg-slate-900 text-amber-400 border-slate-700"
            />
          </div>
        )}

        {block.type === "explanation" && (
          <Textarea
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            placeholder="Explain the concept or code..."
            rows={4}
            className="bg-background"
          />
        )}

        {block.type === "practice" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Question</label>
              <Textarea
                value={block.question}
                onChange={(e) =>
                  onUpdate({ ...block, question: e.target.value })
                }
                placeholder="Write the practice question..."
                rows={3}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Expected Output
                </label>
                <Textarea
                  value={block.expectedOutput || ""}
                  onChange={(e) =>
                    onUpdate({ ...block, expectedOutput: e.target.value })
                  }
                  placeholder="Expected answer/output..."
                  rows={2}
                  className="font-mono text-sm bg-slate-900 text-emerald-400 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  XP Reward
                </label>
                <Input
                  type="number"
                  value={block.xpValue}
                  onChange={(e) =>
                    onUpdate({ ...block, xpValue: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Validation Rule (optional)
              </label>
              <Input
                value={block.validationRule || ""}
                onChange={(e) =>
                  onUpdate({ ...block, validationRule: e.target.value })
                }
                placeholder="e.g., regex pattern or exact match"
                className="font-mono text-sm bg-background"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
