import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  Code,
  Binary,
  Network,
  Layers,
  GitBranch,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Algorithm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  difficulty: string | null;
  time_complexity: string | null;
  space_complexity: string | null;
  code_python: string | null;
  code_javascript: string | null;
  code_cpp: string | null;
  explanation: string | null;
  is_published: boolean | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

const DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "hard", label: "Hard", color: "bg-red-500/10 text-red-600 border-red-500/20" },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  sorting: <Layers className="w-4 h-4" />,
  searching: <Binary className="w-4 h-4" />,
  graphs: <Network className="w-4 h-4" />,
  trees: <GitBranch className="w-4 h-4" />,
  default: <Code className="w-4 h-4" />,
};

export function DSAAdmin() {
  const { toast } = useToast();
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingAlgo, setIsAddingAlgo] = useState(false);
  const [editingAlgo, setEditingAlgo] = useState<Algorithm | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState("python");

  const [algoForm, setAlgoForm] = useState({
    name: "",
    slug: "",
    description: "",
    category_id: "",
    difficulty: "easy",
    time_complexity: "O(n)",
    space_complexity: "O(1)",
    code_python: "",
    code_javascript: "",
    code_cpp: "",
    explanation: "",
    is_published: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [algosRes, catsRes] = await Promise.all([
      supabase.from("algorithms").select("*").order("name"),
      supabase.from("algorithm_categories").select("*").order("sort_order"),
    ]);

    if (algosRes.error) {
      toast({ title: "Error", description: "Failed to fetch algorithms", variant: "destructive" });
    } else {
      setAlgorithms(algosRes.data || []);
    }

    if (catsRes.error) {
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
    } else {
      setCategories(catsRes.data || []);
    }

    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSaveAlgo = async () => {
    setIsSaving(true);
    try {
      if (editingAlgo) {
        const { error } = await supabase
          .from("algorithms")
          .update(algoForm)
          .eq("id", editingAlgo.id);

        if (error) throw error;
        toast({ title: "Success", description: "Algorithm updated successfully" });
      } else {
        const { error } = await supabase.from("algorithms").insert(algoForm);
        if (error) throw error;
        toast({ title: "Success", description: "Algorithm created successfully" });
      }

      setIsAddingAlgo(false);
      setEditingAlgo(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlgo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this algorithm?")) return;

    const { error } = await supabase.from("algorithms").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete algorithm", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Algorithm deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setAlgoForm({
      name: "",
      slug: "",
      description: "",
      category_id: "",
      difficulty: "easy",
      time_complexity: "O(n)",
      space_complexity: "O(1)",
      code_python: "",
      code_javascript: "",
      code_cpp: "",
      explanation: "",
      is_published: true,
    });
  };

  const openEditAlgo = (algo: Algorithm) => {
    setEditingAlgo(algo);
    setAlgoForm({
      name: algo.name,
      slug: algo.slug,
      description: algo.description || "",
      category_id: algo.category_id || "",
      difficulty: algo.difficulty || "easy",
      time_complexity: algo.time_complexity || "O(n)",
      space_complexity: algo.space_complexity || "O(1)",
      code_python: algo.code_python || "",
      code_javascript: algo.code_javascript || "",
      code_cpp: algo.code_cpp || "",
      explanation: algo.explanation || "",
      is_published: algo.is_published ?? true,
    });
    setIsAddingAlgo(true);
  };

  const getCategoryName = (categoryId: string | null) => {
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const getDifficultyBadge = (difficulty: string | null) => {
    const diff = DIFFICULTIES.find((d) => d.value === difficulty);
    return diff ? (
      <Badge variant="outline" className={diff.color}>
        {diff.label}
      </Badge>
    ) : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">DSA Library</h2>
          <p className="text-sm text-muted-foreground">{algorithms.length} algorithms</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingAlgo(null);
            setIsAddingAlgo(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Algorithm
        </Button>
      </div>

      {/* Algorithms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {algorithms.map((algo, index) => (
          <motion.div
            key={algo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-4 h-full flex flex-col" hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    {CATEGORY_ICONS[algo.category_id || "default"] || CATEGORY_ICONS.default}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{algo.name}</h3>
                    <p className="text-xs text-muted-foreground">{getCategoryName(algo.category_id)}</p>
                  </div>
                </div>
                {!algo.is_published && <Badge variant="secondary">Draft</Badge>}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                {algo.description || "No description"}
              </p>

              <div className="flex items-center gap-2 mb-3">
                {getDifficultyBadge(algo.difficulty)}
                <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20">
                  {algo.time_complexity}
                </Badge>
              </div>

              <div className="flex items-center gap-1 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openEditAlgo(algo)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAlgo(algo.id)}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {algorithms.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No algorithms yet</h3>
          <p className="text-muted-foreground mb-4">Add your first algorithm to the DSA library</p>
          <Button
            onClick={() => {
              resetForm();
              setIsAddingAlgo(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Algorithm
          </Button>
        </GlassCard>
      )}

      {/* Algorithm Form Dialog */}
      <Dialog open={isAddingAlgo} onOpenChange={setIsAddingAlgo}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAlgo ? "Edit Algorithm" : "Add New Algorithm"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={algoForm.name}
                  onChange={(e) =>
                    setAlgoForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  placeholder="Binary Search"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={algoForm.slug}
                  onChange={(e) => setAlgoForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="binary-search"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={algoForm.description}
                onChange={(e) => setAlgoForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="A comprehensive explanation of the algorithm..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={algoForm.category_id}
                  onValueChange={(value) => setAlgoForm((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={algoForm.difficulty}
                  onValueChange={(value) => setAlgoForm((prev) => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Time Complexity</label>
                <Input
                  value={algoForm.time_complexity}
                  onChange={(e) => setAlgoForm((prev) => ({ ...prev, time_complexity: e.target.value }))}
                  placeholder="O(log n)"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Space Complexity</label>
                <Input
                  value={algoForm.space_complexity}
                  onChange={(e) => setAlgoForm((prev) => ({ ...prev, space_complexity: e.target.value }))}
                  placeholder="O(1)"
                />
              </div>
            </div>

            {/* Code Snippets with Dark Theme */}
            <div>
              <label className="text-sm font-medium mb-2 block">Code Implementations</label>
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <Tabs value={activeCodeTab} onValueChange={setActiveCodeTab}>
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-700">
                    <TabsList className="bg-slate-800">
                      <TabsTrigger value="python" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        Python
                      </TabsTrigger>
                      <TabsTrigger value="javascript" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                        JavaScript
                      </TabsTrigger>
                      <TabsTrigger value="cpp" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                        C++
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="python" className="m-0">
                    <Textarea
                      value={algoForm.code_python}
                      onChange={(e) => setAlgoForm((prev) => ({ ...prev, code_python: e.target.value }))}
                      placeholder="def binary_search(arr, target):&#10;    left, right = 0, len(arr) - 1&#10;    while left <= right:&#10;        mid = (left + right) // 2&#10;        if arr[mid] == target:&#10;            return mid&#10;    return -1"
                      rows={12}
                      className="font-mono text-sm bg-slate-900 text-emerald-400 border-0 rounded-none focus:ring-0 resize-none"
                    />
                  </TabsContent>
                  <TabsContent value="javascript" className="m-0">
                    <Textarea
                      value={algoForm.code_javascript}
                      onChange={(e) => setAlgoForm((prev) => ({ ...prev, code_javascript: e.target.value }))}
                      placeholder="function binarySearch(arr, target) {&#10;  let left = 0, right = arr.length - 1;&#10;  while (left <= right) {&#10;    const mid = Math.floor((left + right) / 2);&#10;    if (arr[mid] === target) return mid;&#10;  }&#10;  return -1;&#10;}"
                      rows={12}
                      className="font-mono text-sm bg-slate-900 text-yellow-400 border-0 rounded-none focus:ring-0 resize-none"
                    />
                  </TabsContent>
                  <TabsContent value="cpp" className="m-0">
                    <Textarea
                      value={algoForm.code_cpp}
                      onChange={(e) => setAlgoForm((prev) => ({ ...prev, code_cpp: e.target.value }))}
                      placeholder="int binarySearch(vector<int>& arr, int target) {&#10;    int left = 0, right = arr.size() - 1;&#10;    while (left <= right) {&#10;        int mid = left + (right - left) / 2;&#10;        if (arr[mid] == target) return mid;&#10;    }&#10;    return -1;&#10;}"
                      rows={12}
                      className="font-mono text-sm bg-slate-900 text-purple-400 border-0 rounded-none focus:ring-0 resize-none"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Explanation (Markdown)</label>
              <Textarea
                value={algoForm.explanation}
                onChange={(e) => setAlgoForm((prev) => ({ ...prev, explanation: e.target.value }))}
                placeholder="## How it works&#10;&#10;Explain the algorithm step by step..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={algoForm.is_published}
                  onChange={(e) => setAlgoForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                  className="rounded"
                />
                Published
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingAlgo(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAlgo} 
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Algorithm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
