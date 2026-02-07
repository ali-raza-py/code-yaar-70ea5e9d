import { useMemo } from "react";
import DOMPurify from "dompurify";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Proper Markdown parser that handles:
 * - Headings (# ## ###)
 * - Bold/Italic
 * - Inline code
 * - Links
 * - Lists (unordered and ordered)
 * - Horizontal rules
 * - Paragraphs
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = useMemo(() => {
    return parseMarkdown(content);
  }, [content]);

  return (
    <div
      className={`prose prose-invert max-w-none 
        prose-headings:text-foreground 
        prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-xl prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-muted-foreground prose-p:my-3 prose-p:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-em:italic
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
        prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80
        prose-li:text-muted-foreground prose-li:my-1
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-hr:border-border prose-hr:my-8
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Parse Markdown to HTML with proper heading support
 */
export function parseMarkdown(text: string): string {
  if (!text) return "";

  let html = text;

  // Escape HTML to prevent XSS (except for our generated tags)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers - MUST be processed in order from h3 to h1 to prevent double-matching
  // Match lines starting with # (with proper word boundaries)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic (order matters - process bold first)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Inline code (single backticks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');
  html = html.replace(/^\*\*\*$/gm, '<hr />');
  html = html.replace(/^___$/gm, '<hr />');

  // Unordered lists (- or * items)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Ordered lists (1. 2. etc)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs - wrap lines that aren't already wrapped in tags
  const lines = html.split('\n');
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    // Skip if empty or already wrapped in a block element
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<li') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<p') ||
      trimmed.startsWith('</') ||
      trimmed.startsWith('<div')
    ) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  });

  html = processedLines.join('\n');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  // Sanitize HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'code', 'a', 'ul', 'ol', 'li', 'hr', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}
