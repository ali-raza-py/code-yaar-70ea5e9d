import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalCertificates: number;
  activeUsers: number;
  totalXpAwarded: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: coursesCount },
        { count: lessonsCount },
        { count: certsCount },
        { data: gamificationData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("course_lessons").select("*", { count: "exact", head: true }),
        supabase.from("certificates").select("*", { count: "exact", head: true }),
        supabase.from("user_gamification").select("xp_points"),
      ]);

      const totalXp = gamificationData?.reduce((sum, g) => sum + (g.xp_points || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalLessons: lessonsCount || 0,
        totalCertificates: certsCount || 0,
        activeUsers: gamificationData?.length || 0,
        totalXpAwarded: totalXp,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Total Courses", value: stats?.totalCourses || 0, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
    { label: "Total Lessons", value: stats?.totalLessons || 0, icon: Activity, color: "from-violet-500 to-violet-600" },
    { label: "Certificates Issued", value: stats?.totalCertificates || 0, icon: Award, color: "from-amber-500 to-amber-600" },
    { label: "Active Learners", value: stats?.activeUsers || 0, icon: TrendingUp, color: "from-rose-500 to-rose-600" },
    { label: "Total XP Awarded", value: stats?.totalXpAwarded.toLocaleString() || 0, icon: Zap, color: "from-primary to-primary/80" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your learning management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-5" hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium">Create New Course</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">View Leaderboard</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
              <Award className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium">Issue Certificate</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-semibold text-foreground mb-4">System Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">Code-Yaar LMS</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium text-emerald-500">Connected</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium text-emerald-500">Active</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
