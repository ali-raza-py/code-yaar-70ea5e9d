import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Code2,
  GraduationCap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Code Tutoring",
    description: "One-on-one tutoring sessions for Python and C++.",
    features: ["Beginner-friendly", "Flexible scheduling"],
  },
  {
    icon: GraduationCap,
    title: "Assignment Help",
    description: "Get help understanding concepts and approaches.",
    features: ["Code explanations", "Debugging assistance"],
  },
  {
    icon: Briefcase,
    title: "Small Projects",
    description: "Simple websites, scripts, or automation at student rates.",
    features: ["Web development", "Python scripts"],
  },
];

export function ServicesSection() {
  return (
    <section className="py-24" id="services">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Services</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Learning-Based <span className="text-gradient">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Affordable, education-focused services from a student who understands the learning journey.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/about">
              <Button variant="outline">
                Learn More About Me
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
