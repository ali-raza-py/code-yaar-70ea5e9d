import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, User, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/ui/GlassCard";

interface LeaderboardEntry {
  user_id: string;
  xp_points: number;
  level: number;
  full_name: string | null;
  lessons_completed: number;
  courses_completed: number;
}

export function AdminLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Fetch gamification data - XP is earned only through validated actions
      const { data: gamificationData, error: gamError } = await supabase
        .from("user_gamification")
        .select("user_id, xp_points, level, total_lessons_completed, total_courses_completed")
        .order("xp_points", { ascending: false })
        .limit(100);

      if (gamError) throw gamError;

      if (!gamificationData || gamificationData.length === 0) {
        setEntries([]);
        return;
      }

      // Fetch profile names
      const userIds = gamificationData.map((g) => g.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, p.full_name])
      );

      const leaderboardEntries: LeaderboardEntry[] = gamificationData.map((g) => ({
        user_id: g.user_id,
        xp_points: g.xp_points || 0,
        level: g.level || 1,
        full_name: profilesMap.get(g.user_id) || null,
        lessons_completed: g.total_lessons_completed || 0,
        courses_completed: g.total_courses_completed || 0,
      }));

      setEntries(leaderboardEntries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center text-muted-foreground font-mono">{rank}</span>;
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.full_name) return entry.full_name;
    return `Coder #${entry.user_id.slice(0, 6)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
          <p className="text-muted-foreground text-sm">
            Real rankings based on validated XP from lesson completions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLeaderboard}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <GlassCard className="p-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">XP Sources:</strong> Lesson completion, 
            course completion, practice block challenges
          </p>
          <p>
            <strong className="text-foreground">Note:</strong> XP cannot be manually 
            edited. Rankings are 100% data-driven.
          </p>
        </div>
      </GlassCard>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">No data yet</p>
          <p className="text-sm text-muted-foreground">
            Users will appear here once they start earning XP
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const rank = index + 1;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  rank <= 3
                    ? "bg-gradient-to-r from-primary/5 to-transparent border-primary/20"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center">{getRankIcon(rank)}</div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {getDisplayName(entry)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.level} • {entry.lessons_completed} lessons • {entry.courses_completed} courses
                    </p>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">
                    {entry.xp_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
