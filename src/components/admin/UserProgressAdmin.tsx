import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Loader2,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProgress {
  id: string;
  user_id: string;
  section_id: string;
  completed: boolean;
  progress_percentage: number;
  last_accessed_at: string | null;
  created_at: string;
}

interface UserWithProgress {
  user_id: string;
  full_name: string | null;
  progress_count: number;
  total_completed: number;
  avg_percentage: number;
  last_activity: string | null;
}

export function UserProgressAdmin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [usersProgress, setUsersProgress] = useState<UserWithProgress[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userProgressDetails, setUserProgressDetails] = useState<UserProgress[]>([]);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsersProgress();
  }, []);

  const fetchUsersProgress = async () => {
    setIsLoading(true);
    
    // Fetch profiles and user_progress data
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select("*");

    if (progressError) {
      console.error("Error fetching progress:", progressError);
    }

    // Combine data
    const userMap = new Map<string, UserWithProgress>();
    
    profiles?.forEach(profile => {
      userMap.set(profile.user_id, {
        user_id: profile.user_id,
        full_name: profile.full_name,
        progress_count: 0,
        total_completed: 0,
        avg_percentage: 0,
        last_activity: null,
      });
    });

    progress?.forEach(p => {
      const user = userMap.get(p.user_id);
      if (user) {
        user.progress_count++;
        if (p.completed) user.total_completed++;
        user.avg_percentage = Math.round(
          ((user.avg_percentage * (user.progress_count - 1)) + p.progress_percentage) / user.progress_count
        );
        if (!user.last_activity || (p.last_accessed_at && p.last_accessed_at > user.last_activity)) {
          user.last_activity = p.last_accessed_at;
        }
      }
    });

    setUsersProgress(Array.from(userMap.values()).filter(u => u.progress_count > 0));
    setIsLoading(false);
  };

  const fetchUserProgressDetails = async (userId: string) => {
    setSelectedUserId(userId);
    
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("last_accessed_at", { ascending: false });

    if (error) {
      console.error("Error fetching user progress details:", error);
    } else {
      setUserProgressDetails(data || []);
    }
  };

  const handleResetProgress = async () => {
    if (!actionUserId) return;
    setIsProcessing(true);

    const { error } = await supabase
      .from("user_progress")
      .update({ 
        completed: false, 
        progress_percentage: 0,
        last_accessed_at: new Date().toISOString()
      })
      .eq("user_id", actionUserId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User progress has been reset" });
      fetchUsersProgress();
      if (selectedUserId === actionUserId) {
        fetchUserProgressDetails(actionUserId);
      }
    }

    setIsProcessing(false);
    setShowResetDialog(false);
    setActionUserId(null);
  };

  const handleDeleteProgress = async () => {
    if (!actionUserId) return;
    setIsProcessing(true);

    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", actionUserId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User progress has been deleted" });
      fetchUsersProgress();
      if (selectedUserId === actionUserId) {
        setSelectedUserId(null);
        setUserProgressDetails([]);
      }
    }

    setIsProcessing(false);
    setShowDeleteDialog(false);
    setActionUserId(null);
  };

  const handleDeleteSingleProgress = async (progressId: string) => {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("id", progressId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Progress entry deleted" });
      fetchUsersProgress();
      if (selectedUserId) {
        fetchUserProgressDetails(selectedUserId);
      }
    }
  };

  const filteredUsers = usersProgress.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">User Progress Management</h3>
          <p className="text-sm text-muted-foreground">{usersProgress.length} users with progress data</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold">Users</h4>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users with progress data</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.user_id}
                  className={`p-4 hover:bg-secondary/30 cursor-pointer transition-colors ${
                    selectedUserId === user.user_id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => fetchUserProgressDetails(user.user_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {user.user_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{user.total_completed}/{user.progress_count}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.avg_percentage}% avg
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionUserId(user.user_id);
                        setShowResetDialog(true);
                      }}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionUserId(user.user_id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete All
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Details */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold">Progress Details</h4>
          </div>
          
          {!selectedUserId ? (
            <div className="text-center py-12 px-4">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a user to view details</p>
            </div>
          ) : userProgressDetails.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No progress entries found</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {userProgressDetails.map((progress) => (
                <div key={progress.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">
                      {progress.section_id.replace(/-/g, " ")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteSingleProgress(progress.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      progress.completed 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {progress.completed ? "Completed" : "In Progress"}
                    </span>
                    <span className="text-muted-foreground">
                      {progress.progress_percentage}%
                    </span>
                  </div>
                  
                  {progress.last_accessed_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last accessed: {new Date(progress.last_accessed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Reset User Progress
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all progress for this user to 0%. The progress entries will be kept but marked as incomplete. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetProgress} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete All Progress
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all progress data for this user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProgress} 
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
