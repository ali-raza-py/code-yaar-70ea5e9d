import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl",
        "shadow-lg shadow-black/5",
        hover && "transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        glow && "before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
