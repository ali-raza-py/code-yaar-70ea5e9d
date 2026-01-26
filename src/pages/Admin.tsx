import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DailyQuestionAdmin } from "@/components/admin/DailyQuestionAdmin";
import {
  Shield,
  Users,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Search,
  Loader2,
  Video,
  BookOpen,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Upload,
  Link,
} from "lucide-react";

type Tab = "users" | "resources" | "daily";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  is_disabled: boolean;
  created_at: string;
}

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

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");

  // Users state
  const [users, setUsers] = useState<Profile[]>([]);
  
  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    type: "tutorial",
    category: "general",
    url: "",
    difficulty: "beginner",
    language: "general",
    is_published: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    if (activeTab === "daily") {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    if (activeTab === "users") {
      await fetchUsers();
    } else if (activeTab === "resources") {
      await fetchResources();
    }
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
  };

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resources:", error);
      toast({ title: "Error", description: "Failed to fetch resources", variant: "destructive" });
    } else {
      setResources(data || []);
    }
  };

  const toggleUserDisabled = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_disabled: !profile.is_disabled })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `User ${profile.is_disabled ? "enabled" : "disabled"}` });
      fetchUsers();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/quicktime', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Error", description: "File type not supported. Please upload PDF, video, or image files.", variant: "destructive" });
        return;
      }
      // Validate file size (50MB max)
      if (file.size > 52428800) {
        toast({ title: "Error", description: "File too large. Maximum size is 50MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleResourceSubmit = async () => {
    if (!resourceForm.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    setUploadingFile(true);
    let fileUrl = resourceForm.url;
    let filePath: string | null = null;

    // Handle file upload if a file is selected
    if (uploadMode === "file" && selectedFile) {
      const uploadedUrl = await uploadFile(selectedFile);
      if (!uploadedUrl) {
        toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
        setUploadingFile(false);
        return;
      }
      fileUrl = uploadedUrl;
      filePath = selectedFile.name;
    }

    if (editingResource) {
      const { error } = await supabase
        .from("resources")
        .update({
          ...resourceForm,
          url: fileUrl,
          file_path: filePath,
        })
        .eq("id", editingResource.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update resource", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Resource updated" });
        resetResourceForm();
        fetchResources();
      }
    } else {
      const { error } = await supabase.from("resources").insert({
        ...resourceForm,
        url: fileUrl,
        file_path: filePath,
        created_by: user?.id,
      });

      if (error) {
        toast({ title: "Error", description: "Failed to create resource", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Resource created" });
        resetResourceForm();
        fetchResources();
      }
    }
    setUploadingFile(false);
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    const { error } = await supabase.from("resources").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Resource deleted" });
      fetchResources();
    }
  };

  const editResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      category: resource.category || "general",
      url: resource.url || "",
      difficulty: resource.difficulty || "beginner",
      language: resource.language || "general",
      is_published: resource.is_published,
    });
    setShowResourceForm(true);
  };

  const resetResourceForm = () => {
    setShowResourceForm(false);
    setEditingResource(null);
    setSelectedFile(null);
    setUploadMode("url");
    setResourceForm({
      title: "",
      description: "",
      type: "tutorial",
      category: "general",
      url: "",
      difficulty: "beginner",
      language: "general",
      is_published: true,
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Dashboard</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Manage <span className="text-gradient">Code-Yaar</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "resources"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <FileText className="w-4 h-4" />
            Resources
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "daily"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Daily Question
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          {activeTab === "resources" && (
            <Button variant="hero" onClick={() => setShowResourceForm(true)}>
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          )}
        </div>

        {activeTab === "daily" ? (
          <DailyQuestionAdmin />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "users" && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((profile) => (
                        <tr key={profile.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3">
                            <span className="font-medium">{profile.full_name || "No name"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                profile.is_disabled
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {profile.is_disabled ? "Disabled" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserDisabled(profile)}
                              disabled={profile.user_id === user?.id}
                            >
                              {profile.is_disabled ? (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ToggleRight className="w-4 h-4 text-primary" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No users found</div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <>
                {/* Resource Form Modal */}
                {showResourceForm && (
                  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold">
                          {editingResource ? "Edit Resource" : "Add Resource"}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={resetResourceForm}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Title *</label>
                          <Input
                            value={resourceForm.title}
                            onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                            placeholder="Resource title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={resourceForm.description}
                            onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                            placeholder="Brief description"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                              value={resourceForm.type}
                              onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="tutorial">Tutorial</option>
                              <option value="video">Video</option>
                              <option value="pdf">PDF</option>
                              <option value="article">Article</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Difficulty</label>
                            <select
                              value={resourceForm.difficulty}
                              onChange={(e) => setResourceForm({ ...resourceForm, difficulty: e.target.value })}
                              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <Input
                              value={resourceForm.category}
                              onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                              placeholder="e.g., python, algorithms"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            <select
                              value={resourceForm.language}
                              onChange={(e) => setResourceForm({ ...resourceForm, language: e.target.value })}
                              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                              <option value="general">General</option>
                              <option value="python">Python</option>
                              <option value="cpp">C++</option>
                              <option value="javascript">JavaScript</option>
                              <option value="html">HTML/CSS</option>
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

                        {/* URL Input */}
                        {uploadMode === "url" && (
                          <div>
                            <label className="block text-sm font-medium mb-2">URL</label>
                            <Input
                              value={resourceForm.url}
                              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                        )}

                        {/* File Upload */}
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
                                  <p className="text-sm text-muted-foreground">
                                    Click to upload PDF, Video, or Image
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Max 50MB
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="published"
                            checked={resourceForm.is_published}
                            onChange={(e) => setResourceForm({ ...resourceForm, is_published: e.target.checked })}
                            className="rounded border-input"
                          />
                          <label htmlFor="published" className="text-sm font-medium">
                            Published
                          </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button variant="outline" onClick={resetResourceForm} className="flex-1">
                            Cancel
                          </Button>
                          <Button 
                            variant="hero" 
                            onClick={handleResourceSubmit} 
                            className="flex-1"
                            disabled={uploadingFile}
                          >
                            {uploadingFile ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {editingResource ? "Update" : "Create"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`p-5 rounded-xl border ${
                        resource.is_published ? "bg-card border-border" : "bg-muted/50 border-dashed border-border"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {resource.type === "video" && <Video className="w-5 h-5 text-primary" />}
                          {resource.type === "pdf" && <FileText className="w-5 h-5 text-primary" />}
                          {(resource.type === "tutorial" || resource.type === "article") && (
                            <BookOpen className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{resource.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary">{resource.type}</span>
                            <span className="text-xs text-muted-foreground">{resource.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            resource.is_published ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {resource.is_published ? "Published" : "Draft"}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => editResource(resource)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteResource(resource.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredResources.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No resources found. Add your first resource!</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
