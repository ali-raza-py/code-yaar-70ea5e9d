import { useState } from "react";
import { Check, ChevronRight, BookOpen, Code, Zap, Layers, Database, Globe, Server, Cpu, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import type { Language } from "./LanguageSelector";

interface FlowchartNode {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  children?: FlowchartNode[];
  description?: string;
  isOptional?: boolean;
}

const roadmaps: Record<Language, FlowchartNode[]> = {
  python: [
    {
      id: "basics",
      title: "Python Basics",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      description: "Variables, data types, operators",
      children: [
        { id: "syntax", title: "Syntax & Variables", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "datatypes", title: "Data Types", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "operators", title: "Operators", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "control",
      title: "Control Flow",
      icon: GitBranch,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      description: "Loops, conditionals, functions",
      children: [
        { id: "conditionals", title: "If/Else Statements", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "loops", title: "For & While Loops", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "functions", title: "Functions", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      ],
    },
    {
      id: "data-structures",
      title: "Data Structures",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      description: "Lists, dictionaries, sets",
      children: [
        { id: "lists", title: "Lists & Tuples", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "dicts", title: "Dictionaries", icon: Database, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "sets", title: "Sets", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "oop",
      title: "OOP",
      icon: Cpu,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      description: "Classes, objects, inheritance",
      children: [
        { id: "classes", title: "Classes & Objects", icon: Cpu, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "inheritance", title: "Inheritance", icon: GitBranch, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "polymorphism", title: "Polymorphism", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Topics",
      icon: Zap,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      description: "File I/O, modules, APIs",
      children: [
        { id: "files", title: "File Handling", icon: Database, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "modules", title: "Modules & Packages", icon: Layers, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "apis", title: "Working with APIs", icon: Globe, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
      ],
    },
  ],
  javascript: [
    {
      id: "fundamentals",
      title: "JS Fundamentals",
      icon: BookOpen,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      children: [
        { id: "variables", title: "Variables & Types", icon: Code, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
        { id: "operators", title: "Operators", icon: Zap, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
        { id: "strings", title: "Strings & Arrays", icon: Layers, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
      ],
    },
    {
      id: "dom",
      title: "DOM Manipulation",
      icon: Globe,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      children: [
        { id: "selectors", title: "Selectors", icon: Code, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "events", title: "Events", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "manipulation", title: "Element Manipulation", icon: Layers, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      ],
    },
    {
      id: "async",
      title: "Async JavaScript",
      icon: Server,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "callbacks", title: "Callbacks", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "promises", title: "Promises", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "asyncawait", title: "Async/Await", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "es6",
      title: "ES6+ Features",
      icon: Zap,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-300",
      children: [
        { id: "arrow", title: "Arrow Functions", icon: Code, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
        { id: "destructuring", title: "Destructuring", icon: Layers, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
        { id: "modules", title: "Modules", icon: Database, color: "text-violet-600", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
      ],
    },
    {
      id: "frameworks",
      title: "Choose a Framework",
      icon: Cpu,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-300",
      isOptional: true,
      children: [
        { id: "react", title: "React", icon: Code, color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
        { id: "vue", title: "Vue.js", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "angular", title: "Angular", icon: Code, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
      ],
    },
  ],
  typescript: [
    {
      id: "basics",
      title: "TypeScript Basics",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "types", title: "Basic Types", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "interfaces", title: "Interfaces", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "functions", title: "Typed Functions", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "advanced-types",
      title: "Advanced Types",
      icon: Cpu,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "generics", title: "Generics", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "unions", title: "Union Types", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "utility", title: "Utility Types", icon: Zap, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
    {
      id: "oop",
      title: "OOP in TypeScript",
      icon: GitBranch,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "classes", title: "Classes", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "abstract", title: "Abstract Classes", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "decorators", title: "Decorators", icon: Zap, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "tooling",
      title: "Tooling & Config",
      icon: Server,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      children: [
        { id: "tsconfig", title: "tsconfig.json", icon: Database, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "linting", title: "ESLint Setup", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "bundling", title: "Bundling", icon: Layers, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      ],
    },
  ],
  java: [
    {
      id: "basics",
      title: "Java Basics",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      children: [
        { id: "syntax", title: "Syntax & JVM", icon: Code, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "variables", title: "Variables & Types", icon: Layers, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "operators", title: "Operators", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      ],
    },
    {
      id: "oop",
      title: "OOP Concepts",
      icon: Cpu,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "classes", title: "Classes & Objects", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "inheritance", title: "Inheritance", icon: GitBranch, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "interfaces", title: "Interfaces", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "collections",
      title: "Collections",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "lists", title: "Lists", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "maps", title: "Maps", icon: Database, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "sets", title: "Sets", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Java",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "streams", title: "Streams API", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "lambdas", title: "Lambdas", icon: Zap, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "threads", title: "Multithreading", icon: Cpu, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
  ],
  csharp: [
    {
      id: "basics",
      title: "C# Fundamentals",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "syntax", title: "Syntax & .NET", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "types", title: "Data Types", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "control", title: "Control Flow", icon: GitBranch, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
    {
      id: "oop",
      title: "OOP in C#",
      icon: Cpu,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "classes", title: "Classes", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "inheritance", title: "Inheritance", icon: GitBranch, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "interfaces", title: "Interfaces", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "linq",
      title: "LINQ",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "queries", title: "LINQ Queries", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "methods", title: "Method Syntax", icon: Zap, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "lambda", title: "Lambda Expressions", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "async",
      title: "Async Programming",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      children: [
        { id: "tasks", title: "Tasks", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "asyncawait", title: "Async/Await", icon: Zap, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "parallel", title: "Parallel Processing", icon: Cpu, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      ],
    },
  ],
  cpp: [
    {
      id: "basics",
      title: "C++ Basics",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "syntax", title: "Syntax", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "variables", title: "Variables & Types", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "pointers", title: "Pointers", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "oop",
      title: "OOP",
      icon: Cpu,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "classes", title: "Classes", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "inheritance", title: "Inheritance", icon: GitBranch, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "virtual", title: "Virtual Functions", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
    {
      id: "stl",
      title: "STL",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "vectors", title: "Vectors", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "maps", title: "Maps", icon: Database, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "algorithms", title: "Algorithms", icon: Zap, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "memory",
      title: "Memory Management",
      icon: Cpu,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      children: [
        { id: "dynamic", title: "Dynamic Allocation", icon: Code, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "smart", title: "Smart Pointers", icon: Zap, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "raii", title: "RAII", icon: Layers, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
      ],
    },
  ],
  c: [
    {
      id: "basics",
      title: "C Basics",
      icon: BookOpen,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-300",
      children: [
        { id: "syntax", title: "Syntax", icon: Code, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
        { id: "variables", title: "Variables", icon: Layers, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
        { id: "operators", title: "Operators", icon: Zap, color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200" },
      ],
    },
    {
      id: "pointers",
      title: "Pointers",
      icon: Zap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "basics", title: "Pointer Basics", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "arrays", title: "Pointers & Arrays", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "functions", title: "Function Pointers", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "memory",
      title: "Memory",
      icon: Cpu,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      children: [
        { id: "malloc", title: "malloc/free", icon: Code, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "structs", title: "Structs", icon: Layers, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
        { id: "unions", title: "Unions", icon: Database, color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      ],
    },
    {
      id: "files",
      title: "File I/O",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "reading", title: "Reading Files", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "writing", title: "Writing Files", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "binary", title: "Binary Files", icon: Database, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
  ],
  go: [
    {
      id: "basics",
      title: "Go Basics",
      icon: BookOpen,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-300",
      children: [
        { id: "syntax", title: "Syntax", icon: Code, color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
        { id: "variables", title: "Variables & Types", icon: Layers, color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
        { id: "functions", title: "Functions", icon: Zap, color: "text-cyan-600", bgColor: "bg-cyan-50", borderColor: "border-cyan-200" },
      ],
    },
    {
      id: "concurrency",
      title: "Concurrency",
      icon: Cpu,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "goroutines", title: "Goroutines", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "channels", title: "Channels", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "select", title: "Select", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "packages",
      title: "Packages & Modules",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "creating", title: "Creating Packages", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "modules", title: "Go Modules", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "testing", title: "Testing", icon: Zap, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
  ],
  rust: [
    {
      id: "basics",
      title: "Rust Basics",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      children: [
        { id: "syntax", title: "Syntax", icon: Code, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "variables", title: "Variables", icon: Layers, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "functions", title: "Functions", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      ],
    },
    {
      id: "ownership",
      title: "Ownership",
      icon: Zap,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      children: [
        { id: "rules", title: "Ownership Rules", icon: Code, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "borrowing", title: "Borrowing", icon: Layers, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
        { id: "lifetimes", title: "Lifetimes", icon: Zap, color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
      ],
    },
    {
      id: "types",
      title: "Advanced Types",
      icon: Cpu,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "enums", title: "Enums", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "traits", title: "Traits", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "generics", title: "Generics", icon: Zap, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
  ],
  sql: [
    {
      id: "basics",
      title: "SQL Basics",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "select", title: "SELECT", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "where", title: "WHERE", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "orderby", title: "ORDER BY", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "joins",
      title: "JOINs",
      icon: GitBranch,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      children: [
        { id: "inner", title: "INNER JOIN", icon: Code, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "left", title: "LEFT JOIN", icon: Layers, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
        { id: "full", title: "FULL JOIN", icon: Zap, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
      ],
    },
    {
      id: "advanced",
      title: "Advanced SQL",
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "subqueries", title: "Subqueries", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "indexes", title: "Indexes", icon: Zap, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "transactions", title: "Transactions", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
  ],
  html: [
    {
      id: "html-basics",
      title: "HTML Basics",
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      children: [
        { id: "elements", title: "Elements & Tags", icon: Code, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "attributes", title: "Attributes", icon: Layers, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
        { id: "semantic", title: "Semantic HTML", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      ],
    },
    {
      id: "css-basics",
      title: "CSS Basics",
      icon: Layers,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      children: [
        { id: "selectors", title: "Selectors", icon: Code, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "properties", title: "Properties", icon: Layers, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
        { id: "box-model", title: "Box Model", icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      ],
    },
    {
      id: "layout",
      title: "CSS Layout",
      icon: Cpu,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      children: [
        { id: "flexbox", title: "Flexbox", icon: Code, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "grid", title: "CSS Grid", icon: Layers, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
        { id: "responsive", title: "Responsive Design", icon: Globe, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      ],
    },
  ],
};

interface FlowchartRoadmapProps {
  language: Language;
  onBack: () => void;
}

export function FlowchartRoadmap({ language, onBack }: FlowchartRoadmapProps) {
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  const nodes = roadmaps[language] || roadmaps.python;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  const toggleComplete = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Learning Roadmap
          </h2>
          <p className="text-muted-foreground">
            Click on each step to expand and mark as completed
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-8 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Your Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedNodes.length} / {nodes.reduce((acc, n) => acc + 1 + (n.children?.length || 0), 0)} completed
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(completedNodes.length / nodes.reduce((acc, n) => acc + 1 + (n.children?.length || 0), 0)) * 100}%`,
            }}
            className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
          />
        </div>
      </div>

      {/* Flowchart */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-amber-400 to-emerald-500 hidden md:block" />

        <div className="space-y-6">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isExpanded = expandedNodes.includes(node.id);
            const isCompleted = completedNodes.includes(node.id);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Main node */}
                <div
                  onClick={() => toggleNode(node.id)}
                  className={`relative ml-0 md:ml-16 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${node.bgColor} ${node.borderColor} ${
                    isExpanded ? "shadow-lg" : ""
                  }`}
                >
                  {/* Connector dot */}
                  <div
                    className={`absolute -left-[4.5rem] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-md hidden md:flex items-center justify-center ${
                      isCompleted ? "bg-emerald-500" : node.bgColor.replace("50", "500")
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 text-white" />}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${node.bgColor.replace("50", "100")}`}>
                        <Icon className={`w-6 h-6 ${node.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">{node.title}</h3>
                        {node.description && (
                          <p className="text-sm text-muted-foreground">{node.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleComplete(node.id, e)}
                        className={`p-2 rounded-full transition-colors ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Children */}
                  {isExpanded && node.children && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 ml-4 pl-4 border-l-2 border-dashed border-muted-foreground/30 space-y-3"
                    >
                      {node.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildCompleted = completedNodes.includes(child.id);

                        return (
                          <div
                            key={child.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(child.id, e);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              isChildCompleted
                                ? "bg-emerald-50 border border-emerald-200"
                                : `${child.bgColor} border ${child.borderColor} hover:shadow-sm`
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isChildCompleted ? "bg-emerald-500" : "bg-white border-2 border-muted"
                              }`}
                            >
                              {isChildCompleted && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <ChildIcon className={`w-4 h-4 ${isChildCompleted ? "text-emerald-600" : child.color}`} />
                            <span className={`font-medium text-sm ${isChildCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {child.title}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
