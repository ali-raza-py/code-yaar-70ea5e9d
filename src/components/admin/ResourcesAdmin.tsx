import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  Upload,
  Link,
  Video,
  BookOpen,
  Search,
  Filter,
  Clock,
  Megaphone,
  Wrench,
  FileQuestion,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  url: string | null;
  file_path: string | null;
  difficulty: string | null;
  language: string | null;
  is_published: boolean;
  created_at: string;
}

const RESOURCE_CATEGORIES = [
  { value: "tutorials", label: "Tutorials & Guides", icon: BookOpen },
  { value: "tools", label: "Tools & Templates", icon: Wrench },
  { value: "documentation", label: "Documentation & References", icon: FileQuestion },
  { value: "updates", label: "Updates & Announcements", icon: Megaphone },
];

const RESOURCE_TYPES = [
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "article", label: "Article" },
  { value: "template", label: "Template" },
  { value: "tool", label: "Tool" },
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGES = [
  { value: "general", label: "General" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML/CSS" },
];

export function ResourcesAdmin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "tutorial",
    category: "tutorials",
    url: "",
    difficulty: "beginner",
    language: "general",
    is_published: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchResources();
    }
  }, [isAdmin]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({ title: "Error", description: "Failed to load resources", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/quicktime', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "File type not supported", variant: "destructive" });
        return;
      }
      if (file.size > 52428800) {
        toast({ title: "Error", description: "File too large. Max 50MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    let fileUrl = formData.url;
    let filePath: string | null = null;

    try {
      if (uploadMode === "file" && selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (!uploadedUrl) {
          toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
          setIsSaving(false);
          return;
        }
        fileUrl = uploadedUrl;
        filePath = selectedFile.name;
      }

      if (editingResource) {
        const { error } = await supabase
          .from("resources")
          .update({
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            type: formData.type,
            category: formData.category,
            url: fileUrl || null,
            file_path: filePath,
            difficulty: formData.difficulty,
            language: formData.language,
            is_published: formData.is_published,
          })
          .eq("id", editingResource.id);

        if (error) throw error;
        toast({ title: "Resource updated successfully" });
      } else {
        const { error } = await supabase.from("resources").insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          type: formData.type,
          category: formData.category,
          url: fileUrl || null,
          file_path: filePath,
          difficulty: formData.difficulty,
          language: formData.language,
          is_published: formData.is_published,
          created_by: user?.id,
        });

        if (error) throw error;
        toast({ title: "Resource created successfully" });
      }

      resetForm();
      fetchResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({ title: "Error", description: "Failed to save resource", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Resource deleted" });
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      category: resource.category || "tutorials",
      url: resource.url || "",
      difficulty: resource.difficulty || "beginner",
      language: resource.language || "general",
      is_published: resource.is_published,
    });
    setUploadMode(resource.file_path ? "file" : "url");
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingResource(null);
    setSelectedFile(null);
    setUploadMode("url");
    setFormData({
      title: "",
      description: "",
      type: "tutorial",
      category: "tutorials",
      url: "",
      difficulty: "beginner",
      language: "general",
      is_published: true,
    });
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const recentResources = [...resources]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getCategoryIcon = (category: string | null) => {
    const cat = RESOURCE_CATEGORIES.find(c => c.value === category);
    return cat?.icon || FileText;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "pdf": return FileText;
      default: return BookOpen;
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {RESOURCE_CATEGORIES.map((cat) => {
          const count = resources.filter(r => r.category === cat.value).length;
          const Icon = cat.icon;
          return (
            <div
              key={cat.value}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCategory === cat.value
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="font-medium text-sm">{cat.label}</p>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Recently Added */}
      {recentResources.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-medium text-sm">Recently Added</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentResources.map((resource) => (
              <div
                key={resource.id}
                className="flex-shrink-0 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
              >
                <span className="font-medium">{resource.title}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[140px]"
        >
          <option value="all">All Types</option>
          {RESOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">
                {editingResource ? "Edit Resource" : "Add New Resource"}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {RESOURCE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {RESOURCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Mode Toggle */}
              <div>
                <label className="block text-sm font-medium mb-2">Resource Source</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      uploadMode === "url"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    URL Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      uploadMode === "file"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
              </div>

              {uploadMode === "url" && (
                <div>
                  <label className="block text-sm font-medium mb-2">URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              {uploadMode === "file" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Upload File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.mp4,.webm,.mov,.png,.jpg,.jpeg,.gif,.webp"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="ml-2 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, Video, or Image (Max 50MB)</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="resource-published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="resource-published" className="text-sm font-medium">
                  Published
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving} className="flex-1 gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingResource ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type);
            const CategoryIcon = getCategoryIcon(resource.category);
            return (
              <div
                key={resource.id}
                className={`p-5 rounded-xl border transition-all hover:shadow-md ${
                  resource.is_published
                    ? "bg-card border-border"
                    : "bg-muted/50 border-dashed border-border"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{resource.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary">{resource.type}</span>
                      <span className="text-xs text-muted-foreground">{resource.difficulty}</span>
                    </div>
                  </div>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {RESOURCE_CATEGORIES.find(c => c.value === resource.category)?.label || resource.category}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${resource.is_published ? "text-primary" : "text-muted-foreground"}`}>
                    {resource.is_published ? "Published" : "Draft"}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(resource)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
