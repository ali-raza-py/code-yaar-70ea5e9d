import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Code2, GraduationCap, MessageCircle, CheckCircle, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Code Tutoring",
    description: "One-on-one tutoring sessions for Python and C++. Learn at your own pace with personalized guidance.",
    features: ["Beginner-friendly", "Flexible scheduling", "Project-based learning"],
  },
  {
    icon: GraduationCap,
    title: "Assignment Help",
    description: "Stuck on a programming assignment? Get help understanding concepts and approaches—not just answers.",
    features: ["Code explanations", "Debugging assistance", "Learning-focused"],
  },
  {
    icon: Briefcase,
    title: "Small Projects",
    description: "Need a simple website, script, or automation? Early-stage freelance projects at student-friendly rates.",
    features: ["Web development", "Python scripts", "Automation tools"],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Services</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Learning-Based <span className="text-gradient">Services</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Affordable, education-focused services from a student who understands the learning journey. 
            Perfect for beginners and early-stage projects.
          </p>
        </div>

        {/* Services Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Why Work With Me */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-8 md:p-12 rounded-2xl bg-card border border-border">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">
              Why Work With a Student Developer?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Fresh Perspective",
                  description: "Recent learner who remembers the challenges of getting started.",
                },
                {
                  title: "Affordable Rates",
                  description: "Student-friendly pricing that won't break your budget.",
                },
                {
                  title: "Education First",
                  description: "Focus on teaching, not just delivering—learn while getting help.",
                },
                {
                  title: "Growing Together",
                  description: "Be part of the journey as Code Fague expands its services.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-2xl bg-gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-glow opacity-30" />
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                Let's Collaborate
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Have a project in mind or need help with your coding journey? 
                Reach out and let's discuss how I can help.
              </p>
              <Link to="/contact">
                <Button variant="secondary" size="lg" className="font-semibold">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
