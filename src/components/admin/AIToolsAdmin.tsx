import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  Search,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";

interface AITool {
  id: string;
  name: string;
  description: string | null;
  use_case: string | null;
  category: string;
  url: string | null;
  icon: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

const categories = [
  { value: "coding-assistants", label: "Coding Assistants" },
  { value: "web-app-builders", label: "Web/App Builders" },
  { value: "ai-design", label: "AI Design Tools" },
  { value: "automation", label: "Automation & Productivity" },
  { value: "learning-research", label: "Learning & Research AI" },
];

export function AIToolsAdmin() {
  const { toast } = useToast();
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editingTool, setEditingTool] = useState<Partial<AITool> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching AI tools:", error);
      toast({ title: "Error", description: "Failed to fetch AI tools", variant: "destructive" });
    } else {
      setTools(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!editingTool?.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    
    const toolData = {
      name: editingTool.name,
      description: editingTool.description || null,
      use_case: editingTool.use_case || null,
      category: editingTool.category || "coding-assistants",
      url: editingTool.url || null,
      icon: editingTool.icon || null,
      is_featured: editingTool.is_featured ?? true,
      is_published: editingTool.is_published ?? true,
      sort_order: editingTool.sort_order || 0,
    };

    let error;
    
    if (editingTool.id) {
      const result = await supabase
        .from("ai_tools")
        .update(toolData)
        .eq("id", editingTool.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("ai_tools")
        .insert([toolData]);
      error = result.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Tool ${editingTool.id ? "updated" : "created"} successfully` });
      setIsEditing(false);
      setEditingTool(null);
      fetchTools();
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    const { error } = await supabase
      .from("ai_tools")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Tool deleted successfully" });
      fetchTools();
    }
  };

  const togglePublished = async (tool: AITool) => {
    const { error } = await supabase
      .from("ai_tools")
      .update({ is_published: !tool.is_published })
      .eq("id", tool.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Tool ${tool.is_published ? "unpublished" : "published"}` });
      fetchTools();
    }
  };

  const filteredTools = tools.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isEditing) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{editingTool?.id ? "Edit Tool" : "Add New Tool"}</h3>
          <Button variant="ghost" size="icon" onClick={() => { setIsEditing(false); setEditingTool(null); }}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={editingTool?.name || ""}
              onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
              placeholder="Tool name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={editingTool?.description || ""}
              onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
              placeholder="Brief description of the tool"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Use Case</label>
            <Input
              value={editingTool?.use_case || ""}
              onChange={(e) => setEditingTool({ ...editingTool, use_case: e.target.value })}
              placeholder="Primary use case"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={editingTool?.category || "coding-assistants"}
                onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <Input
                type="number"
                value={editingTool?.sort_order || 0}
                onChange={(e) => setEditingTool({ ...editingTool, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <Input
              value={editingTool?.url || ""}
              onChange={(e) => setEditingTool({ ...editingTool, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingTool?.is_featured ?? true}
                onChange={(e) => setEditingTool({ ...editingTool, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingTool?.is_published ?? true}
                onChange={(e) => setEditingTool({ ...editingTool, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm">Published</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setIsEditing(false); setEditingTool(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Tool
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Tools Management</h3>
            <p className="text-sm text-muted-foreground">{tools.length} tools total</p>
          </div>
        </div>

        <Button onClick={() => { setIsEditing(true); setEditingTool({}); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Tools List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No Tools Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterCategory !== "all" 
              ? "Try adjusting your search or filters."
              : "Add your first AI tool to get started."}
          </p>
          <Button onClick={() => { setIsEditing(true); setEditingTool({}); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tool
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tool</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{tool.name}</span>
                        {tool.url && (
                          <a href={tool.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-muted-foreground hover:text-primary">
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                        {tool.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{tool.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs bg-secondary capitalize">
                        {categories.find(c => c.value === tool.category)?.label || tool.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.is_published 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {tool.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublished(tool)}
                          title={tool.is_published ? "Unpublish" : "Publish"}
                        >
                          {tool.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setIsEditing(true); setEditingTool(tool); }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tool.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
