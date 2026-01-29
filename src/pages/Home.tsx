import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ContactSection } from "@/components/home/ContactSection";
import { HelpFAQSection } from "@/components/home/HelpFAQSection";
import { ArrowRight, Brain, GraduationCap, Zap, Users, Rocket, Code2, ChevronDown, Database, GitBranch, Layers, Binary } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Hero Section - Full Viewport, Clean & Minimal */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Vibrant Background with Multiple Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
        
        {/* Animated Glow Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Decorative Wave/Curve - Enhanced */}
        <div className="absolute bottom-0 right-0 w-full h-2/3 overflow-hidden pointer-events-none">
          <svg 
            viewBox="0 0 1440 600" 
            className="absolute bottom-0 right-0 w-full h-full"
            preserveAspectRatio="xMidYMax slice"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path 
              d="M0,400 C200,300 400,500 600,350 C800,200 1000,450 1200,300 C1400,150 1440,250 1440,250 L1440,600 L0,600 Z" 
              fill="url(#waveGradient)"
              className="animate-pulse"
              style={{ animationDuration: '4s' }}
            />
            <path 
              d="M0,450 C150,380 350,520 550,400 C750,280 950,480 1150,350 C1350,220 1440,320 1440,320 L1440,600 L0,600 Z" 
              fill="url(#waveGradient2)"
            />
            <path 
              d="M0,500 C200,420 400,550 600,450 C800,350 1000,500 1200,400 C1400,300 1440,380 1440,380 L1440,600 L0,600 Z" 
              fill="hsl(var(--primary))"
              opacity="0.15"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl">
            {/* Main Heading - Large & Bold */}
            <h1 
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.1] mb-8 animate-fade-in opacity-0"
              style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
            >
              The Power
              <br />
              of <span className="text-primary">Code</span>
            </h1>

            {/* Subheading - Clean & Simple */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed animate-fade-in opacity-0"
              style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
            >
              Master programming with AI-powered tools and structured learning. 
              Built by students, for students.
            </p>

            {/* Single CTA Button */}
            <div 
              className="animate-fade-in opacity-0"
              style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
            >
              <Link to="/learn">
                <Button variant="hero" size="xl" className="font-semibold group text-lg px-8 py-6 hover-card-smooth">
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-out cursor-pointer animate-fade-in opacity-0"
          style={{ animationDelay: "600ms", animationFillMode: "forwards" }}
          aria-label="Scroll down"
        >
          <span className="text-sm font-medium">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* User Dashboard Section - Only for logged in users */}
      {user && (
        <section className="py-20 bg-card/50 border-y border-border">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <ProgressTracker />
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-black mb-4 text-foreground">
              Everything You Need<span className="text-primary">.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Powerful tools combined with structured learning resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Brain,
                title: "AI Code Generator",
                description: "Generate code from natural language. Supports Python and C++ with clear explanations.",
              },
              {
                icon: Zap,
                title: "Smart Debugging",
                description: "Get intelligent debugging assistance. Understand errors and learn to fix them.",
              },
              {
                icon: GraduationCap,
                title: "Structured Learning",
                description: "Access tutorials, videos, and PDFs organized by skill level.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card border border-border hover-card-smooth"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-all duration-300 ease-out group-hover:bg-primary/20 group-hover:scale-110">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DSA Section - Two Boxes */}
      <section className="py-24 md:py-32 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Binary className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Master the Fundamentals</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-4 text-foreground">
              Data Structures & Algorithms<span className="text-primary">.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Industry-standard CS fundamentals with code examples, complexity analysis, and practice problems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Data Structures Box */}
            <Link to="/algorithms?type=data-structures" className="block">
              <div className="group p-8 rounded-2xl bg-card border border-border hover-card-smooth h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-glow">
                    <Database className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Data Structures</h3>
                    <p className="text-muted-foreground text-sm">Organize & store data efficiently</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Arrays", "Strings", "Linked List", "Stack", "Queue", "Hash Table", "Trees", "Heaps", "Graphs"].map((topic) => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {topic}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center text-primary font-medium">
                  Explore Data Structures
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                </div>
              </div>
            </Link>

            {/* Algorithms Box */}
            <Link to="/algorithms?type=algorithms" className="block">
              <div className="group p-8 rounded-2xl bg-card border border-border hover-card-smooth h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-glow">
                    <GitBranch className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Algorithms</h3>
                    <p className="text-muted-foreground text-sm">Step-by-step problem solving</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Sorting", "Searching", "Recursion", "Backtracking", "Greedy", "Dynamic Programming", "Graph Algorithms", "Bit Manipulation"].map((topic) => (
                    <div key={topic} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      <Code2 className="w-3.5 h-3.5 text-primary" />
                      {topic}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center text-primary font-medium">
                  Explore Algorithms
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 ease-out group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-16 md:gap-24">
            {[
              { value: "1K+", label: "Students", icon: Users },
              { value: "500+", label: "Projects Built", icon: Rocket },
              { value: "24/7", label: "AI Support", icon: Brain },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <stat.icon className="w-6 h-6 text-primary transition-transform duration-300 ease-out group-hover:scale-110" />
                  <span className="text-4xl md:text-5xl font-black text-foreground">{stat.value}</span>
                </div>
                <span className="text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 bg-card/30 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border mb-6">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Start Your Journey</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black mb-6 text-foreground">
              Ready to Level Up<span className="text-primary">?</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg max-w-lg mx-auto">
              Join Code-Yaar today and experience the future of programming education.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl" className="font-semibold group text-lg px-8 py-6 hover-card-smooth">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Help & FAQ Section - At the bottom of Home page only */}
      <HelpFAQSection />

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
