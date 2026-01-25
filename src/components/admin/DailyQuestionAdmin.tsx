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
  Star,
  Loader2,
  Clock,
  User,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface DailyQuestion {
  id: string;
  question_text: string;
  is_active: boolean;
  deadline: string;
  created_at: string;
}

interface DailyAnswer {
  id: string;
  user_id: string;
  answer_text: string;
  is_highlighted: boolean;
  created_at: string;
  author_name?: string;
}

export function DailyQuestionAdmin() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<DailyQuestion | null>(null);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("daily_questions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setQuestions(data || []);

      if (data && data.length > 0) {
        const active = data.find((q) => q.is_active);
        if (active) {
          setSelectedQuestion(active);
          fetchAnswers(active.id);
        }
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnswers = async (questionId: string) => {
    try {
      const { data: answersData } = await supabase
        .from("daily_answers")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: true });

      if (answersData && answersData.length > 0) {
        const userIds = [...new Set(answersData.map((a) => a.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [
            p.user_id,
            p.full_name || "Anonymous",
          ]) || []
        );

        setAnswers(
          answersData.map((a) => ({
            ...a,
            author_name: profileMap.get(a.user_id) || "Anonymous",
          }))
        );
      } else {
        setAnswers([]);
      }
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuestion.trim() || !deadline) return;

    setIsCreating(true);
    try {
      // Deactivate current active question
      await supabase
        .from("daily_questions")
        .update({ is_active: false })
        .eq("is_active", true);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("daily_questions").insert({
        question_text: newQuestion.trim(),
        deadline: new Date(deadline).toISOString(),
        is_active: true,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({ title: "Question created and activated" });
      setNewQuestion("");
      setDeadline("");
      fetchQuestions();
    } catch (error) {
      console.error("Error creating question:", error);
      toast({
        title: "Error",
        description: "Failed to create question.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleActivate = async (questionId: string) => {
    try {
      // Deactivate all
      await supabase
        .from("daily_questions")
        .update({ is_active: false })
        .eq("is_active", true);

      // Activate selected
      await supabase
        .from("daily_questions")
        .update({ is_active: true })
        .eq("id", questionId);

      toast({ title: "Question activated" });
      fetchQuestions();
    } catch (error) {
      console.error("Error activating question:", error);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question and all its answers?")) return;

    try {
      await supabase.from("daily_questions").delete().eq("id", questionId);
      toast({ title: "Question deleted" });
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const handleHighlight = async (answerId: string, currentHighlighted: boolean) => {
    try {
      // Remove current highlight
      if (selectedQuestion) {
        await supabase
          .from("daily_answers")
          .update({ is_highlighted: false })
          .eq("question_id", selectedQuestion.id);
      }

      // Set new highlight
      if (!currentHighlighted) {
        await supabase
          .from("daily_answers")
          .update({ is_highlighted: true })
          .eq("id", answerId);
      }

      toast({ title: currentHighlighted ? "Highlight removed" : "Answer highlighted" });
      if (selectedQuestion) fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error("Error highlighting answer:", error);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm("Delete this answer?")) return;

    try {
      await supabase.from("daily_answers").delete().eq("id", answerId);
      toast({ title: "Answer deleted" });
      if (selectedQuestion) fetchAnswers(selectedQuestion.id);
    } catch (error) {
      console.error("Error deleting answer:", error);
    }
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Question */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Create Daily Question</h3>
        </div>

        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <Textarea
            placeholder="Enter today's question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Deadline</label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isCreating || !newQuestion.trim() || !deadline}>
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Activate"}
            </Button>
          </div>
        </form>
      </div>

      {/* Recent Questions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Questions</h3>
        </div>

        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                q.is_active
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedQuestion(q);
                fetchAnswers(q.id);
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {q.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        Active
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(q.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <p className="text-foreground line-clamp-2">{q.question_text}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    Deadline: {format(new Date(q.deadline), "MMM d, h:mm a")}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!q.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(q.id);
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answers for Selected Question */}
      {selectedQuestion && (
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Answers ({answers.length})
            </h3>
          </div>

          {answers.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No answers yet</p>
          ) : (
            <div className="space-y-3">
              {answers.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-lg border ${
                    a.is_highlighted
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{a.author_name}</span>
                        {a.is_highlighted && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-foreground text-sm">{a.answer_text}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {format(new Date(a.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${a.is_highlighted ? "text-amber-500" : ""}`}
                        onClick={() => handleHighlight(a.id, a.is_highlighted)}
                        title={a.is_highlighted ? "Remove highlight" : "Highlight answer"}
                      >
                        <Star className={`w-4 h-4 ${a.is_highlighted ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteAnswer(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
