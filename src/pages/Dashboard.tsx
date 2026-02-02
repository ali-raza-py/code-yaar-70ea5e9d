import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Trophy,
  Flame,
  BookOpen,
  Target,
  Code2,
  ArrowRight,
  Sparkles,
  Award,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MyCertificates } from "@/components/certificates/MyCertificates";
import { Leaderboard } from "@/components/dashboard/Leaderboard";

interface UserStats {
  xp_points: number;
  level: number;
  current_streak: number;
  total_lessons_completed: number;
  total_courses_completed: number;
  total_algorithms_studied: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned_at: string;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "certificates" | "leaderboard">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Check if user has completed onboarding
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single();

      if (!prefs?.onboarding_completed) {
        navigate("/onboarding");
        return;
      }

      // Fetch gamification stats
      const { data: gamification } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (gamification) {
        setStats(gamification);
      } else {
        // Create default stats
        setStats({
          xp_points: 0,
          level: 1,
          current_streak: 0,
          total_lessons_completed: 0,
          total_courses_completed: 0,
          total_algorithms_studied: 0,
        });
      }

      // Fetch user badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", user.id);

      if (userBadges) {
        setBadges(
          userBadges.map((ub: any) => ({
            id: ub.badges.id,
            name: ub.badges.name,
            icon: ub.badges.icon,
            earned_at: ub.earned_at,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelTitle = (level: number): string => {
    if (level <= 5) return "Beginner Coder";
    if (level <= 15) return "Developer";
    if (level <= 30) return "Senior Developer";
    return "Master Coder";
  };

  const getXPForNextLevel = (level: number): number => {
    return level * 500;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const xpProgress = stats
    ? ((stats.xp_points % getXPForNextLevel(stats.level)) /
        getXPForNextLevel(stats.level)) *
      100
    : 0;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.email?.split("@")[0]}!
            </h1>
          </div>
          <p className="text-muted-foreground">
            Continue your learning journey. You're doing great!
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
          >
            <Zap className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === "leaderboard" ? "default" : "outline"}
            onClick={() => setActiveTab("leaderboard")}
          >
            <Users className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            variant={activeTab === "certificates" ? "default" : "outline"}
            onClick={() => setActiveTab("certificates")}
          >
            <Award className="w-4 h-4 mr-2" />
            My Certificates
          </Button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* XP & Level Card */}
              <GlassCard className="p-6" glow>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Level {stats?.level || 1}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={stats?.xp_points || 0} />
                  </span>
                  <span className="text-muted-foreground ml-2">XP</span>
                </div>
                <p className="text-sm text-primary font-medium mb-2">
                  {getLevelTitle(stats?.level || 1)}
                </p>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {getXPForNextLevel(stats?.level || 1) - (stats?.xp_points || 0) % getXPForNextLevel(stats?.level || 1)} XP to next level
                </p>
              </GlassCard>

              {/* Streak Card */}
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={stats?.current_streak || 0} />
                  </span>
                  <span className="text-muted-foreground ml-2">days</span>
                </div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </GlassCard>

              {/* Lessons Completed */}
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <BookOpen className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={stats?.total_lessons_completed || 0} />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
              </GlassCard>

              {/* Badges Earned */}
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <Trophy className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={badges.length} />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <GlassCard
                className="p-6 cursor-pointer"
                onClick={() => navigate("/ai-tool")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Generate Roadmap
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create your personalized learning path
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </GlassCard>

              <GlassCard
                className="p-6 cursor-pointer"
                onClick={() => navigate("/courses")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-green-500/10">
                    <BookOpen className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Browse Courses
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore free learning content
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </GlassCard>

              <GlassCard
                className="p-6 cursor-pointer"
                onClick={() => navigate("/algorithms")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/10">
                    <Code2 className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Algorithm Library
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Master data structures & algorithms
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </GlassCard>
            </div>

            {/* Badges Section */}
            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Your Badges
                </h2>
                <div className="flex flex-wrap gap-4">
                  {badges.map((badge) => (
                    <GlassCard
                      key={badge.id}
                      className="p-4 flex items-center gap-3"
                      hover={false}
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      <span className="font-medium text-foreground">
                        {badge.name}
                      </span>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State for Badges */}
            {badges.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-8 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No badges yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Complete lessons, courses, and challenges to earn badges!
                  </p>
                  <Button onClick={() => navigate("/courses")}>
                    Start Learning
                  </Button>
                </GlassCard>
              </motion.div>
            )}
          </>
        ) : activeTab === "leaderboard" ? (
          /* Leaderboard Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  XP Leaderboard
                </h2>
              </div>
              <Leaderboard />
            </GlassCard>
          </motion.div>
        ) : (
          /* Certificates Tab */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                My Certificates
              </h2>
              <p className="text-muted-foreground">
                Your earned certificates from completed courses. Each certificate has a unique verification ID.
              </p>
            </div>
            <MyCertificates />
          </motion.div>
        )}
      </div>
    </div>
  );
}