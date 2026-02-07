import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  FileText,
  Users,
  Trophy,
  Award,
  Settings,
  ChevronDown,
  ChevronRight,
  Code,
  Brain,
  HelpCircle,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string }[];
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    children: [
      { id: "all-courses", label: "All Courses" },
      { id: "create-course", label: "Create Course" },
      { id: "sections", label: "Course Sections" },
      { id: "lessons", label: "Lessons" },
    ],
  },
  { id: "dsa", label: "DSA Library", icon: Code },
  {
    id: "users",
    label: "Users",
    icon: Users,
    children: [
      { id: "all-users", label: "All Users" },
      { id: "progress", label: "Progress Tracking" },
    ],
  },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "ai-tools", label: "AI Tools", icon: Brain },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "help-faq", label: "Help & FAQ", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AdminLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

export function AdminLayout({ activeSection, onSectionChange, children }: AdminLayoutProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["courses"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isActive = (itemId: string, childId?: string) => {
    if (childId) return activeSection === childId;
    return activeSection === itemId || activeSection.startsWith(itemId);
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onSectionChange(item.id);
              setIsMobileMenuOpen(false);
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            active && !hasChildren
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          )}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            <span className="text-muted-foreground">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
        </button>

        {hasChildren && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-6 py-1 space-y-1">
                  {item.children!.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        onSectionChange(child.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                        activeSection === child.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {child.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className="flex bg-background min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-card/50 flex-col sticky top-0 h-[calc(100vh-4rem)]">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Code className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Code-Yaar LMS v1.0
          </div>
        </div>
      </aside>

      {/* Mobile Header - Fixed below main navbar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Code className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-0 z-30 bg-background pt-32"
          >
            <nav className="p-4 space-y-1 overflow-y-auto h-full">
              {navItems.map(renderNavItem)}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 lg:pt-0 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
