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
      className={`lesson-prose max-w-none text-[15.5px] md:text-base leading-[1.75] text-foreground/90
        [&_h1]:relative [&_h1]:text-3xl md:[&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h1]:mt-10 [&_h1]:mb-5 [&_h1]:pb-3 [&_h1]:border-b [&_h1]:border-border/60
        [&_h2]:relative [&_h2]:text-2xl md:[&_h2]:text-[1.7rem] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mt-9 [&_h2]:mb-4 [&_h2]:pl-4 [&_h2]:border-l-4 [&_h2]:border-primary
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-7 [&_h3]:mb-3
        [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-6 [&_h4]:mb-2
        [&_p]:my-4 [&_p]:leading-[1.8] [&_p]:text-foreground/80
        [&_strong]:text-foreground [&_strong]:font-semibold
        [&_em]:italic [&_em]:text-foreground/90
        [&_a]:text-primary [&_a]:font-medium [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-[3px] hover:[&_a]:decoration-primary [&_a]:transition-colors
        [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:font-medium [&_code]:border [&_code]:border-primary/20
        [&_ul]:my-5 [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul>li]:relative [&_ul>li]:pl-2 [&_ul>li]:marker:text-primary
        [&_ol]:my-5 [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol>li]:pl-2 [&_ol>li]:marker:text-primary [&_ol>li]:marker:font-semibold
        [&_li]:text-foreground/80 [&_li]:leading-relaxed
        [&_ul]:list-disc [&_ol]:list-decimal
        [&_hr]:my-10 [&_hr]:border-0 [&_hr]:h-px [&_hr]:bg-gradient-to-r [&_hr]:from-transparent [&_hr]:via-border [&_hr]:to-transparent
        [&_blockquote]:my-5 [&_blockquote]:pl-5 [&_blockquote]:py-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/60 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:text-foreground/85
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

  // Blockquotes (> text)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/(<blockquote>.*?<\/blockquote>\n?)+/g, (match) => match.replace(/<\/blockquote>\n?<blockquote>/g, '<br />'));

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
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'code', 'a', 'ul', 'ol', 'li', 'hr', 'br', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}
