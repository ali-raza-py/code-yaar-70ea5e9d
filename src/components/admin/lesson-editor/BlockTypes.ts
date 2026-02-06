export type BlockType = "text" | "code" | "output" | "explanation" | "practice";

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

export type LessonBlock = TextBlock | CodeBlock | OutputBlock | ExplanationBlock | PracticeBlock;

export const BLOCK_LABELS: Record<BlockType, { label: string; description: string; color: string }> = {
  text: {
    label: "Text Block",
    description: "Headings, paragraphs, lists",
    color: "from-blue-500 to-blue-600",
  },
  code: {
    label: "Code Block",
    description: "Syntax highlighted code",
    color: "from-emerald-500 to-emerald-600",
  },
  output: {
    label: "Output Block",
    description: "Expected code output",
    color: "from-amber-500 to-amber-600",
  },
  explanation: {
    label: "Explanation",
    description: "Plain explanation text",
    color: "from-violet-500 to-violet-600",
  },
  practice: {
    label: "Practice Block",
    description: "XP-earning challenge",
    color: "from-rose-500 to-rose-600",
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
