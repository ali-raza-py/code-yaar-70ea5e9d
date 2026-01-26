import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Login" },
  { value: "learning", label: "Learning Platform" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "resources", label: "Resources" },
  { value: "technical", label: "Technical Issues" },
];

export default function Help() {
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("help_faq")
        .select("id, question, answer, category")
        .eq("is_published", true)
        .order("category")
        .order("sort_order");

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQEntry[]>);

  return (
    <>
      <Helmet>
        <title>Help & FAQ | Code-Yaar</title>
        <meta name="description" content="Find answers to common questions about Code-Yaar's learning platform, AI tools, and resources." />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How can we <span className="text-gradient">help</span>?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Find answers to frequently asked questions about Code-Yaar
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card border-border"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No FAQs found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFaqs).map(([category, items]) => (
                <div key={category}>
                  <h2 className="font-semibold text-lg mb-3 text-foreground">
                    {FAQ_CATEGORIES.find((c) => c.value === category)?.label || category}
                  </h2>
                  <div className="space-y-2">
                    {items.map((faq) => (
                      <div
                        key={faq.id}
                        className="bg-card rounded-xl border border-border overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
                        >
                          <span className="font-medium text-foreground pr-4">{faq.question}</span>
                          {expandedId === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {expandedId === faq.id && (
                          <div className="px-4 pb-4">
                            <div className="pt-2 border-t border-border">
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-card border border-border text-center">
            <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Get in touch with us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
