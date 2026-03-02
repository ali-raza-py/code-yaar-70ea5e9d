export type BlockType = "text" | "code" | "output" | "explanation" | "practice" | "image";

export interface TextBlock {
  type: "text";
  id: string;
  content: string;
  heading?: "h1" | "h2" | "h3" | "paragraph";
}

export interface CodeBlock {
  type: "code";
  id: string;
  language: "python" | "javascript" | "cpp" | "java" | "sql" | "html" | "css";
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}

export interface OutputBlock {
  type: "output";
  id: string;
  output: string;
  linkedCodeBlockId?: string;
}

export interface ExplanationBlock {
  type: "explanation";
  id: string;
  content: string;
}

export interface PracticeBlock {
  type: "practice";
  id: string;
  question: string;
  expectedOutput?: string;
  validationRule?: string;
  xpValue: number;
  hints?: string[];
}

export interface ImageBlock {
  type: "image";
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width?: "full" | "large" | "medium" | "small";
}

export type LessonBlock = TextBlock | CodeBlock | OutputBlock | ExplanationBlock | PracticeBlock | ImageBlock;

export const BLOCK_LABELS: Record<BlockType, { label: string; description: string; color: string; icon: string }> = {
  text: {
    label: "Text",
    description: "Headings, paragraphs, lists",
    color: "from-blue-500 to-blue-600",
    icon: "FileText",
  },
  code: {
    label: "Code",
    description: "Syntax highlighted code",
    color: "from-emerald-500 to-emerald-600",
    icon: "Code",
  },
  output: {
    label: "Output",
    description: "Expected code output",
    color: "from-amber-500 to-amber-600",
    icon: "Terminal",
  },
  explanation: {
    label: "Explanation",
    description: "Plain explanation text",
    color: "from-violet-500 to-violet-600",
    icon: "MessageSquare",
  },
  practice: {
    label: "Practice",
    description: "XP-earning challenge",
    color: "from-rose-500 to-rose-600",
    icon: "Zap",
  },
  image: {
    label: "Image",
    description: "Inline image or diagram",
    color: "from-cyan-500 to-cyan-600",
    icon: "ImageIcon",
  },
};

export const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
] as const;
