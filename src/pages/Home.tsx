import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ArrowRight, Brain, GraduationCap, Zap, Users, Rocket, Sparkles, Code2, ChevronDown, HelpCircle } from "lucide-react";

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
                <Button variant="hero" size="xl" className="font-semibold group text-lg px-8 py-6">
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer animate-fade-in opacity-0"
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
            <div className="max-w-4xl mx-auto space-y-6">
              <ProgressTracker />
              {/* Quick Help Link */}
              <Link 
                to="/help" 
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">Need Help?</p>
                  <p className="text-sm text-muted-foreground">Browse FAQs and find answers</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
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
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-16 md:gap-24">
            {[
              { value: "1K+", label: "Students", icon: Users },
              { value: "500+", label: "Projects Built", icon: Rocket },
              { value: "24/7", label: "AI Support", icon: Brain },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
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

      {/* Newsletter Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-black mb-4 text-foreground">
              Weekly Resources<span className="text-primary">.</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join 10,000+ developers getting curated repos & tools every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-5 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              <Button variant="hero" size="lg" className="font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

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
              <Button variant="hero" size="xl" className="font-semibold group text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
