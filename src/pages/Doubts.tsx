import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Plus,
  Filter,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Doubt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  topic: string;
  vote_count: number;
  answer_count: number;
  is_resolved: boolean;
  created_at: string;
}

const TOPICS = [
  { value: "all", label: "All Topics" },
  { value: "algorithms", label: "Algorithms" },
  { value: "courses", label: "Courses" },
  { value: "roadmap", label: "Roadmap" },
  { value: "general_cs", label: "General CS" },
  { value: "career", label: "Career" },
];

export default function Doubts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [filteredDoubts, setFilteredDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDoubt, setNewDoubt] = useState({
    title: "",
    content: "",
    topic: "general_cs",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDoubts();
  }, []);

  useEffect(() => {
    filterDoubts();
  }, [doubts, searchQuery, topicFilter]);

  const fetchDoubts = async () => {
    try {
      const { data, error } = await supabase
        .from("doubts")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoubts(data || []);
    } catch (error) {
      console.error("Error fetching doubts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoubts = () => {
    let filtered = [...doubts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doubt) =>
          doubt.title.toLowerCase().includes(query) ||
          doubt.content.toLowerCase().includes(query)
      );
    }

    if (topicFilter !== "all") {
      filtered = filtered.filter((doubt) => doubt.topic === topicFilter);
    }

    setFilteredDoubts(filtered);
  };

  const handleSubmitDoubt = async () => {
    if (!user) {
      toast.error("Please sign in to ask a question");
      navigate("/auth");
      return;
    }

    if (!newDoubt.title.trim() || !newDoubt.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("doubts").insert({
        user_id: user.id,
        title: newDoubt.title.trim(),
        content: newDoubt.content.trim(),
        topic: newDoubt.topic,
      });

      if (error) throw error;

      toast.success("Question submitted successfully!");
      setIsDialogOpen(false);
      setNewDoubt({ title: "", content: "", topic: "general_cs" });
      fetchDoubts();
    } catch (error: any) {
      console.error("Error submitting doubt:", error);
      toast.error("Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case "algorithms":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "courses":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "roadmap":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "career":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Community Doubts
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ask questions, share knowledge, and help fellow learners. Our community is here to help!
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((topic) => (
                <SelectItem key={topic.value} value={topic.value}>
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Title
                  </label>
                  <Input
                    placeholder="What's your question?"
                    value={newDoubt.title}
                    onChange={(e) =>
                      setNewDoubt({ ...newDoubt, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Details
                  </label>
                  <Textarea
                    placeholder="Provide more context about your question..."
                    value={newDoubt.content}
                    onChange={(e) =>
                      setNewDoubt({ ...newDoubt, content: e.target.value })
                    }
                    rows={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Topic
                  </label>
                  <Select
                    value={newDoubt.topic}
                    onValueChange={(value) =>
                      setNewDoubt({ ...newDoubt, topic: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.filter((t) => t.value !== "all").map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSubmitDoubt}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Doubts List */}
        {filteredDoubts.length > 0 ? (
          <div className="space-y-4">
            {filteredDoubts.map((doubt, index) => (
              <motion.div
                key={doubt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <GlassCard className="p-6 cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Vote & Answer counts */}
                    <div className="flex flex-col items-center gap-2 text-center min-w-[60px]">
                      <div
                        className={`p-2 rounded-lg ${
                          doubt.vote_count > 0
                            ? "bg-green-500/10 text-green-500"
                            : "bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium block">
                          {doubt.vote_count}
                        </span>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${
                          doubt.answer_count > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium block">
                          {doubt.answer_count}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={getTopicColor(doubt.topic)}
                        >
                          {TOPICS.find((t) => t.value === doubt.topic)?.label}
                        </Badge>
                        {doubt.is_resolved && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {doubt.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {doubt.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(doubt.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No questions yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Be the first to ask a question!
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
