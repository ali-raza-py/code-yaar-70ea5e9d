import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, MessageSquare, Code2, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ProgressStats {
  questionsAnswered: number;
  aiRequests: number;
  accountCreated: string | null;
}

export function ProgressTracker() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    questionsAnswered: 0,
    aiRequests: 0,
    accountCreated: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get answers count
      const { count: answersCount } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get daily answers count
      const { count: dailyAnswersCount } = await supabase
        .from("daily_answers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get AI requests count
      const { count: aiCount } = await supabase
        .from("user_activity")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("activity_type", "ai_request");

      // Get AI chat history count
      const { count: chatCount } = await supabase
        .from("ai_chat_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        questionsAnswered: (answersCount || 0) + (dailyAnswersCount || 0),
        aiRequests: (aiCount || 0) + (chatCount || 0),
        accountCreated: user.created_at || null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      icon: MessageSquare,
      label: "Questions Answered",
      value: stats.questionsAnswered,
    },
    {
      icon: Code2,
      label: "AI Code Requests",
      value: stats.aiRequests,
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: stats.accountCreated
        ? format(new Date(stats.accountCreated), "MMM d, yyyy")
        : "N/A",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">My Progress</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg bg-secondary/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
