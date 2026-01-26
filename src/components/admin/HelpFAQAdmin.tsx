import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  GripVertical,
  Search,
} from "lucide-react";

interface FAQEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Login" },
  { value: "learning", label: "Learning Platform" },
  { value: "ai-tools", label: "AI Tools" },
  { value: "resources", label: "Resources" },
  { value: "technical", label: "Technical Issues" },
];

export function HelpFAQAdmin() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    is_published: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchFaqs();
    }
  }, [isAdmin]);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("help_faq")
        .select("*")
        .order("category")
        .order("sort_order");

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({ title: "Error", description: "Failed to load FAQs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({ title: "Error", description: "Question and answer are required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from("help_faq")
          .update({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            category: formData.category,
            is_published: formData.is_published,
          })
          .eq("id", editingFaq.id);

        if (error) throw error;
        toast({ title: "FAQ updated successfully" });
      } else {
        const maxOrder = Math.max(...faqs.map(f => f.sort_order), -1);
        const { error } = await supabase.from("help_faq").insert({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category,
          is_published: formData.is_published,
          sort_order: maxOrder + 1,
        });

        if (error) throw error;
        toast({ title: "FAQ created successfully" });
      }

      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast({ title: "Error", description: "Failed to save FAQ", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const { error } = await supabase.from("help_faq").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "FAQ deleted" });
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast({ title: "Error", description: "Failed to delete FAQ", variant: "destructive" });
    }
  };

  const handleEdit = (faq: FAQEntry) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "general",
      is_published: true,
    });
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

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Help & FAQ Management</h2>
            <p className="text-sm text-muted-foreground">{faqs.length} entries</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add FAQ Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]"
        >
          <option value="all">All Categories</option>
          {FAQ_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question *</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., How do I reset my password?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Answer *</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a clear and helpful answer..."
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="faq-published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="faq-published" className="text-sm font-medium">
                  Published
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving} className="flex-1 gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingFaq ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No FAQ entries found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedFaqs).map(([category, items]) => (
            <div key={category} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 bg-secondary/50 border-b border-border">
                <h3 className="font-medium text-sm">
                  {FAQ_CATEGORIES.find((c) => c.value === category)?.label || category}
                  <span className="text-muted-foreground ml-2">({items.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-border">
                {items.map((faq) => (
                  <div key={faq.id} className="p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">{faq.question}</p>
                              {!faq.is_published && (
                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(faq)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(faq.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
