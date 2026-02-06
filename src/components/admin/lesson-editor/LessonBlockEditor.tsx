import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  Code,
  Terminal,
  MessageSquare,
  Zap,
  Save,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockRenderer } from "./BlockRenderer";
import {
  LessonBlock,
  BlockType,
  BLOCK_LABELS,
  TextBlock,
  CodeBlock,
  OutputBlock,
  ExplanationBlock,
  PracticeBlock,
} from "./BlockTypes";
import { cn } from "@/lib/utils";

interface LessonBlockEditorProps {
  blocks: LessonBlock[];
  onChange: (blocks: LessonBlock[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function LessonBlockEditor({
  blocks,
  onChange,
  onSave,
  isSaving = false,
}: LessonBlockEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const createBlock = (type: BlockType): LessonBlock => {
    const id = generateId();
    switch (type) {
      case "text":
        return { type: "text", id, content: "", heading: "paragraph" };
      case "code":
        return { type: "code", id, language: "python", code: "", showLineNumbers: true };
      case "output":
        return { type: "output", id, output: "" };
      case "explanation":
        return { type: "explanation", id, content: "" };
      case "practice":
        return { type: "practice", id, question: "", xpValue: 25 };
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: LessonBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    onChange(newBlocks);
  };

  const getCodeBlocks = () => blocks.filter((b): b is CodeBlock => b.type === "code");

  const calculateTotalXp = () => {
    return blocks
      .filter((b): b is PracticeBlock => b.type === "practice")
      .reduce((sum, b) => sum + b.xpValue, 0);
  };

  const blockButtons = [
    { type: "text" as BlockType, icon: FileText, color: "text-blue-500" },
    { type: "code" as BlockType, icon: Code, color: "text-emerald-500" },
    { type: "output" as BlockType, icon: Terminal, color: "text-amber-500" },
    { type: "explanation" as BlockType, icon: MessageSquare, color: "text-violet-500" },
    { type: "practice" as BlockType, icon: Zap, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {blocks.length} blocks
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium text-primary">
            {calculateTotalXp()} XP total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Lesson
          </Button>
        </div>
      </div>

      {/* Add Block Toolbar */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Add block:</span>
          {blockButtons.map(({ type, icon: Icon, color }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => addBlock(type)}
              className="gap-2"
            >
              <Icon className={cn("w-4 h-4", color)} />
              {BLOCK_LABELS[type].label}
            </Button>
          ))}
        </div>
      </GlassCard>

      {/* Blocks List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, index) => (
            <BlockRenderer
              key={block.id}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              codeBlocks={getCodeBlocks()}
              onUpdate={(updated) => updateBlock(index, updated)}
              onDelete={() => deleteBlock(index)}
              onMoveUp={() => moveBlock(index, index - 1)}
              onMoveDown={() => moveBlock(index, index + 1)}
            />
          ))}
        </AnimatePresence>

        {blocks.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <div className="text-muted-foreground mb-4">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium">No blocks yet</p>
              <p className="text-sm">Add your first block to start building the lesson</p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {blockButtons.slice(0, 3).map(({ type, icon: Icon, color }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(type)}
                  className="gap-2"
                >
                  <Icon className={cn("w-4 h-4", color)} />
                  {BLOCK_LABELS[type].label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Block Types Legend */}
      <GlassCard className="p-4">
        <h4 className="text-sm font-medium mb-3">Block Types Guide</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(BLOCK_LABELS).map(([type, { label, description, color }]) => (
            <div
              key={type}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50"
            >
              <div className={cn("text-xs font-medium mb-1", `bg-gradient-to-r ${color} bg-clip-text text-transparent`)}>
                {label}
              </div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
