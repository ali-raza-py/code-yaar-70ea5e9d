import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  FileText,
  Code,
  Terminal,
  MessageSquare,
  Zap,
  Save,
  Eye,
  PenLine,
  Loader2,
  ImageIcon,
  Grip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { BlockRenderer } from "./BlockRenderer";
import { LivePreview } from "./LivePreview";
import {
  LessonBlock,
  BlockType,
  BLOCK_LABELS,
  CodeBlock,
  PracticeBlock,
} from "./BlockTypes";
import { cn } from "@/lib/utils";

interface LessonBlockEditorProps {
  blocks: LessonBlock[];
  onChange: (blocks: LessonBlock[]) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const BLOCK_BUTTONS: { type: BlockType; icon: typeof FileText; shortLabel: string }[] = [
  { type: "text", icon: FileText, shortLabel: "Text" },
  { type: "code", icon: Code, shortLabel: "Code" },
  { type: "output", icon: Terminal, shortLabel: "Output" },
  { type: "explanation", icon: MessageSquare, shortLabel: "Explain" },
  { type: "practice", icon: Zap, shortLabel: "Practice" },
  { type: "image", icon: ImageIcon, shortLabel: "Image" },
];

export function LessonBlockEditor({
  blocks,
  onChange,
  onSave,
  isSaving = false,
}: LessonBlockEditorProps) {
  const [activeView, setActiveView] = useState<"split" | "edit" | "preview">("split");

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
      case "image":
        return { type: "image", id, url: "", alt: "", width: "large" };
    }
  };

  const addBlock = (type: BlockType) => {
    onChange([...blocks, createBlock(type)]);
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

  const totalXp = blocks
    .filter((b): b is PracticeBlock => b.type === "practice")
    .reduce((sum, b) => sum + b.xpValue, 0);

  const editorContent = (
    <div className="space-y-3 p-4 overflow-y-auto h-full">
      {/* Add block toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-border/40">
        {BLOCK_BUTTONS.map(({ type, icon: Icon, shortLabel }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            onClick={() => addBlock(type)}
            className="h-7 text-xs gap-1.5 px-2.5"
          >
            <Icon className="w-3 h-3" />
            {shortLabel}
          </Button>
        ))}
      </div>

      {/* Blocks */}
      <div className="space-y-2.5">
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
          <div className="text-center py-12 border border-dashed border-border/60 rounded-lg">
            <Grip className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No blocks yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1 mb-3">Click a block type above to begin</p>
            <div className="flex justify-center gap-1.5">
              {BLOCK_BUTTONS.slice(0, 3).map(({ type, icon: Icon, shortLabel }) => (
                <Button key={type} variant="outline" size="sm" onClick={() => addBlock(type)} className="h-7 text-xs gap-1.5 px-2.5">
                  <Icon className="w-3 h-3" />
                  {shortLabel}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const previewContent = (
    <div className="p-6 overflow-y-auto h-full bg-background">
      <LivePreview blocks={blocks} />
    </div>
  );

  return (
    <div className="flex flex-col h-[65vh] border border-border rounded-xl overflow-hidden bg-card">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </span>
          {totalXp > 0 && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-xs font-semibold text-primary">{totalXp} XP</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* View toggles */}
          <div className="flex items-center rounded-md border border-border bg-secondary/30 p-0.5">
            <button
              onClick={() => setActiveView("edit")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                activeView === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PenLine className="w-3 h-3 inline mr-1" />
              Edit
            </button>
            <button
              onClick={() => setActiveView("split")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                activeView === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Split
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                activeView === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Preview
            </button>
          </div>

          <Button size="sm" onClick={onSave} disabled={isSaving} className="h-7 text-xs ml-2">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {activeView === "edit" && editorContent}
        {activeView === "preview" && previewContent}
        {activeView === "split" && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={55} minSize={35}>
              {editorContent}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={25}>
              <div className="h-full border-l border-border/30">
                <div className="px-4 py-1.5 border-b border-border/30 bg-secondary/10">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Preview</span>
                </div>
                {previewContent}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
