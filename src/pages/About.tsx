import { Button } from "@/components/ui/button";
import { Users, Linkedin, Mail, Target, Rocket, Lightbulb } from "lucide-react";
import developerPhoto from "@/assets/developer-photo.jpg";
export default function About() {
  return <div className="min-h-screen py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6 shadow-soft">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Our Team</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-foreground tracking-tight">
            Meet the <span className="text-primary">Team</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Passionate developers on a mission to make programming education accessible to everyone.
          </p>
        </div>

        {/* Team Cards */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CEO Card */}
            <div className="p-8 rounded-2xl bg-card border border-border hover-lift animate-fade-in stagger-1">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-border group-hover:ring-primary/30 transition-all duration-300">
                    <img src={developerPhoto} alt="Ali Raza - CEO of Code Fague" className="w-full h-full object-cover object-center" loading="eager" decoding="async" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-soft">
                    CEO
                  </div>
                </div>

                <h2 className="font-display text-xl font-bold mb-1 text-foreground">Ali Raza</h2>
                <p className="text-primary font-medium text-sm mb-4">Chief Executive Officer</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Visionary leader driving Code Fague's mission to revolutionize programming education for students worldwide.
                </p>

                <div className="flex gap-2">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="mailto:ali@codefague.com">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* CTO Card */}
            <div className="p-8 rounded-2xl bg-card border border-border hover-lift animate-fade-in stagger-2">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-border group-hover:ring-primary/30 transition-all duration-300 bg-secondary flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">A</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-3 py-1 rounded-full text-background text-xs font-semibold shadow-soft bg-primary">
                    CTO
                  </div>
                </div>

                <h2 className="font-display text-xl font-bold mb-1 text-foreground">Abdullah</h2>
                <p className="text-primary font-medium text-sm mb-4">Chief Technology Officer</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Technical architect behind Code Fague's AI-powered platform, building scalable systems for learners.
                </p>

                <div className="flex gap-2">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="mailto:abdullah@codefague.com">
                    <Button variant="outline" size="sm" className="hover-lift">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-10 text-center text-foreground animate-fade-in">
            Our Mission<span className="text-primary">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
            icon: Target,
            title: "Clear Goals",
            description: "Learning should be direct and purposeful. Every feature serves your growth."
          }, {
            icon: Rocket,
            title: "Student-First",
            description: "Built by learners who understand the real challenges of mastering programming."
          }, {
            icon: Lightbulb,
            title: "Real Results",
            description: "Practical tools and resources that actually help you ship code."
          }].map((item, index) => <div key={item.title} className={`p-6 rounded-xl bg-card border border-border hover-lift animate-fade-in stagger-${index + 1}`}>
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>)}
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="p-8 md:p-10 rounded-2xl bg-card border border-border">
            <h2 className="font-display text-xl font-bold mb-5 text-foreground">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Code Fague started with a simple frustration: learning to code was harder than it needed to be. 
                Resources were either too complex, too shallow, or just plain boring.
              </p>
              <p>
                We wanted something different—a platform that explains code like a patient mentor, 
                that doesn't just solve problems but helps you truly understand them.
              </p>
              <p>
                Today, Code Fague serves thousands of students who want to learn programming the right way—with 
                clarity, practical projects, and AI assistance that actually makes sense.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}