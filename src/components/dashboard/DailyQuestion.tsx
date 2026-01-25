import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  HelpCircle,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  Star,
  User,
} from "lucide-react";
import { format, formatDistanceToNow, isAfter } from "date-fns";

interface DailyQuestion {
  id: string;
  question_text: string;
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

export function DailyQuestion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState<DailyQuestion | null>(null);
  const [answers, setAnswers] = useState<DailyAnswer[]>([]);
  const [userAnswer, setUserAnswer] = useState<DailyAnswer | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDailyQuestion();
  }, [user]);

  const fetchDailyQuestion = async () => {
    setIsLoading(true);
    try {
      // Get active daily question
      const { data: questionData, error: questionError } = await supabase
        .from("daily_questions")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (questionError) throw questionError;

      if (!questionData) {
        setQuestion(null);
        setIsLoading(false);
        return;
      }

      setQuestion(questionData);

      // Get answers for this question
      const { data: answersData } = await supabase
        .from("daily_answers")
        .select("*")
        .eq("question_id", questionData.id)
        .order("is_highlighted", { ascending: false })
        .order("created_at", { ascending: true });

      if (answersData && answersData.length > 0) {
        // Fetch author profiles
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

        const enrichedAnswers = answersData.map((a) => ({
          ...a,
          author_name: profileMap.get(a.user_id) || "Anonymous",
        }));

        setAnswers(enrichedAnswers);

        // Check if current user already answered
        if (user) {
          const userAnswerData = enrichedAnswers.find((a) => a.user_id === user.id);
          setUserAnswer(userAnswerData || null);
        }
      } else {
        setAnswers([]);
        setUserAnswer(null);
      }
    } catch (error) {
      console.error("Error fetching daily question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !question || !answerText.trim()) return;

    if (answerText.trim().length < 10) {
      toast({
        title: "Answer too short",
        description: "Please provide a more detailed answer.",
        variant: "destructive",
      });
      return;
    }

    // Check if deadline passed
    if (isAfter(new Date(), new Date(question.deadline))) {
      toast({
        title: "Deadline passed",
        description: "The submission deadline for this question has passed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("daily_answers").insert({
        question_id: question.id,
        user_id: user.id,
        answer_text: answerText.trim(),
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already answered",
            description: "You have already submitted an answer for today's question.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Answer submitted",
        description: "Your answer has been submitted successfully.",
      });

      setAnswerText("");
      fetchDailyQuestion();
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Daily Question</h3>
        </div>
        <p className="text-muted-foreground text-center py-6">
          No active question today. Check back later!
        </p>
      </div>
    );
  }

  const deadlinePassed = isAfter(new Date(), new Date(question.deadline));
  const highlightedAnswer = answers.find((a) => a.is_highlighted);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Daily Question</h3>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {deadlinePassed ? (
              <span className="text-destructive">Deadline passed</span>
            ) : (
              <span className="text-muted-foreground">
                Ends {formatDistanceToNow(new Date(question.deadline), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        <p className="text-lg text-foreground leading-relaxed">{question.question_text}</p>
      </div>

      {/* User's submission or form */}
      <div className="p-6 border-b border-border bg-secondary/30">
        {!user ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Sign in to submit your answer</p>
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium text-sm"
            >
              Sign In
            </a>
          </div>
        ) : userAnswer ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Answer</span>
              {userAnswer.is_highlighted && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                  <Star className="w-3 h-3" />
                  Highlighted
                </span>
              )}
            </div>
            <p className="text-foreground">{userAnswer.answer_text}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Submitted {format(new Date(userAnswer.created_at), "MMM d, h:mm a")}
            </p>
          </div>
        ) : deadlinePassed ? (
          <p className="text-muted-foreground text-center py-4">
            The deadline has passed for this question.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Write your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="min-h-[100px] mb-3 resize-none bg-background"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {answerText.length}/2000 characters
              </span>
              <Button type="submit" size="sm" disabled={isSubmitting || !answerText.trim()}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Answer
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Highlighted answer */}
      {highlightedAnswer && highlightedAnswer.id !== userAnswer?.id && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">Highlighted Answer</span>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {highlightedAnswer.author_name}
              </span>
            </div>
            <p className="text-foreground">{highlightedAnswer.answer_text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
