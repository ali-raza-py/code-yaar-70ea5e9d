import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutputBlockProps {
  output: string;
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function OutputBlock({
  output,
  title = "Output",
  collapsible = false,
  defaultExpanded = true,
}: OutputBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const lines = output.split("\n");
  const isLong = lines.length > 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-border bg-card my-4"
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/50 ${
          collapsible || isLong ? "cursor-pointer hover:bg-secondary" : ""
        }`}
        onClick={() => (collapsible || isLong) && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        {(collapsible || isLong) && (
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Output */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <pre className="p-4 text-sm font-mono text-primary leading-relaxed overflow-x-auto">
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
