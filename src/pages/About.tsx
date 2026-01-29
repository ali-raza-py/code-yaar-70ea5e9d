import { motion } from "framer-motion";
import { Linkedin, Mail, Code, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import aliRazaPhoto from "@/assets/ali-raza-ceo.jpg";
import abdullahPhoto from "@/assets/abdullah-cto.png";

const teamMembers = [
  {
    name: "Ali Raza",
    role: "Founder & CEO",
    image: aliRazaPhoto,
    description:
      "Ali Raza is the Founder and CEO of Code-Yaar, responsible for vision, product direction, and building a high-quality learning ecosystem for developers.",
    linkedin: "https://linkedin.com",
    email: "ali@codeyaar.com",
  },
  {
    name: "Abdullah",
    role: "Chief Technology Officer",
    image: abdullahPhoto,
    description:
      "Abdullah is the CTO of Code-Yaar, leading platform architecture, backend systems, scalability, and technical innovation.",
    linkedin: "https://linkedin.com",
    email: "abdullah@codeyaar.com",
  },
];

const values = [
  {
    icon: Code,
    title: "Real-World Skills",
    description: "We teach practical programming that translates directly to industry success.",
  },
  {
    icon: Target,
    title: "Structured Learning",
    description: "Clear roadmaps and step-by-step courses designed for maximum retention.",
  },
  {
    icon: Zap,
    title: "Hands-On Practice",
    description: "Learn by building real projects with guidance from industry professionals.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">About Code-Yaar</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
              Building the Future of <span className="text-primary">Developer Education</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Code-Yaar is a modern learning platform focused on teaching real-world programming skills 
              with structured courses, hands-on practice, and industry-ready roadmaps.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover-lift text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Our Team</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Meet the <span className="text-primary">Leadership</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="group"
              >
                <div className="p-8 rounded-2xl bg-card border border-border hover-lift">
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Image */}
                    <div className="relative mb-6">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-border group-hover:ring-primary/30 transition-all duration-300">
                        <img
                          src={member.image}
                          alt={`${member.name} - ${member.role}`}
                          className="w-full h-full object-cover object-top"
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-soft">
                        {member.role.includes("CEO") ? "CEO" : "CTO"}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium text-sm mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{member.description}</p>

                    {/* Social Links */}
                    <div className="flex gap-3">
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="hover-lift">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </a>
                      <a href={`mailto:${member.email}`}>
                        <Button variant="outline" size="sm" className="hover-lift">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-8 md:p-12 rounded-2xl bg-card border border-border">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Our Story<span className="text-primary">.</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Code-Yaar started with a simple frustration: learning to code was harder than it needed to be. 
                  Resources were either too complex, too shallow, or just plain boring.
                </p>
                <p>
                  We wanted something different—a platform that explains code like a patient mentor, 
                  that doesn't just solve problems but helps you truly understand them.
                </p>
                <p>
                  Today, Code-Yaar serves thousands of students who want to learn programming the right way—with 
                  clarity, practical projects, and AI assistance that actually makes sense.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
