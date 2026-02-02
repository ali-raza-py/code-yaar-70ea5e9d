import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  user_id: string;
  xp_points: number;
  level: number;
  full_name: string | null;
}

type Period = "weekly" | "allTime";

export function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("allTime");

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Fetch top users by XP
      const { data: gamificationData, error: gamError } = await supabase
        .from("user_gamification")
        .select("user_id, xp_points, level")
        .order("xp_points", { ascending: false })
        .limit(50);

      if (gamError) throw gamError;

      if (!gamificationData || gamificationData.length === 0) {
        setEntries([]);
        return;
      }

      // Fetch profile names for these users
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
      }));

      setEntries(leaderboardEntries);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-primary" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="w-5 text-center text-muted-foreground font-mono">{rank}</span>;
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.full_name) return entry.full_name;
    return `Coder #${entry.user_id.slice(0, 6)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Period Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={period === "allTime" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("allTime")}
        >
          All Time
        </Button>
        <Button
          variant={period === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setPeriod("weekly")}
          disabled
          title="Coming soon"
        >
          Weekly
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No leaderboard data yet.</p>
          <p className="text-sm">Complete lessons to earn XP and appear here!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = user?.id === entry.user_id;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                  isCurrentUser
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/20"
                }`}
              >
                {/* Rank */}
                <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {getDisplayName(entry)}
                      {isCurrentUser && <span className="text-xs ml-2 opacity-70">(You)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold text-foreground">{entry.xp_points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Show user's rank if not in top 10 */}
      {user && entries.length > 10 && !entries.slice(0, 10).some((e) => e.user_id === user.id) && (
        <div className="mt-4 pt-4 border-t border-border">
          {entries.map((entry, index) => {
            if (entry.user_id !== user.id) return null;
            const rank = index + 1;
            return (
              <div
                key={entry.user_id}
                className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/30"
              >
                <div className="w-8 flex justify-center">
                  <span className="text-muted-foreground font-mono">{rank}</span>
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary truncate">
                      {getDisplayName(entry)} <span className="text-xs opacity-70">(You)</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{entry.xp_points.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
