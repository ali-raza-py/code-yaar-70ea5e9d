import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2 } from "lucide-react";
export function ContactSection() {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. I'll get back to you soon."
      });
      setFormData({
        name: "",
        email: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return <section className="py-24 bg-card/50" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Get in Touch</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Let's <span className="text-gradient">Connect</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions or want to collaborate? I'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:hello@codefague.com" className="text-muted-foreground hover:text-primary transition-colors">btwaliraza110@gmil.com

              </a>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-muted-foreground text-sm">
                  I typically respond within 24-48 hours.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-card border border-border">
              <div className="space-y-4">
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required className="bg-secondary/50" />
                <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="bg-secondary/50" />
                <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your Message" required className="min-h-[120px] bg-secondary/50 resize-none" />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>;
}