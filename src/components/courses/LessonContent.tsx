import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, ChevronRight, ChevronLeft, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./CodeBlock";
import { OutputBlock } from "./OutputBlock";
import { GlassCard } from "@/components/ui/GlassCard";

interface LessonContentProps {
  title: string;
  content: string;
  lessonOrder: number;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

export function LessonContent({
  title,
  content,
  lessonOrder,
  estimatedMinutes,
  xpReward,
  isCompleted,
  hasNext,
  hasPrevious,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
}: LessonContentProps) {
  // Parse markdown content and extract code blocks
  const renderedContent = useMemo(() => {
    const parts: JSX.Element[] = [];
    let key = 0;

    // Split content by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const outputBlockRegex = /\*\*Output:\*\*\n```\n([\s\S]*?)```/g;

    // First, handle output blocks specially
    let processedContent = content.replace(outputBlockRegex, (_, output) => {
      return `__OUTPUT_BLOCK_${key++}__${output}__END_OUTPUT_BLOCK__`;
    });

    // Then handle regular code blocks
    processedContent = processedContent.replace(codeBlockRegex, (_, lang, code) => {
      return `__CODE_BLOCK_${key++}__${lang || "text"}__${code.trim()}__END_CODE_BLOCK__`;
    });

    // Split by our markers and render
    const segments = processedContent.split(/(__CODE_BLOCK_\d+__|__OUTPUT_BLOCK_\d+__)/);

    segments.forEach((segment, index) => {
      if (segment.startsWith("__CODE_BLOCK_")) {
        const match = segment.match(/__CODE_BLOCK_(\d+)__(\w+)__(.*)__END_CODE_BLOCK__/s);
        if (match) {
          const [, , lang, code] = match;
          parts.push(
            <CodeBlock key={`code-${index}`} code={code} language={lang} />
          );
        }
      } else if (segment.startsWith("__OUTPUT_BLOCK_")) {
        const match = segment.match(/__OUTPUT_BLOCK_\d+__([\s\S]*)__END_OUTPUT_BLOCK__/);
        if (match) {
          parts.push(
            <OutputBlock key={`output-${index}`} output={match[1].trim()} />
          );
        }
      } else if (segment.trim()) {
        // Render as markdown
        parts.push(
          <div
            key={`text-${index}`}
            className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-li:text-muted-foreground prose-table:border-border prose-th:border-border prose-td:border-border prose-hr:border-border"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(segment),
            }}
          />
        );
      }
    });

    return parts;
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Lesson {lessonOrder}</span>
          <span>•</span>
          <Clock className="w-4 h-4" />
          <span>{estimatedMinutes} min read</span>
          <span>•</span>
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{xpReward} XP</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Lesson Content */}
      <div className="space-y-4">{renderedContent}</div>

      {/* Completion & Navigation */}
      <GlassCard className="p-6 mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed!</span>
              </div>
            ) : (
              <Button
                onClick={onComplete}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete (+{xpReward} XP)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button onClick={onNext} disabled={!hasNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// Simple markdown parser
function parseMarkdown(text: string): string {
  let html = text;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim());
    const isHeader = match.includes('---');
    if (isHeader) return '';
    const cellHtml = cells.map(c => `<td class="border border-border px-4 py-2">${c.trim()}</td>`).join('');
    return `<tr>${cellHtml}</tr>`;
  });

  // Paragraphs
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="my-4">$1</p>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8" />');

  return html;
}
