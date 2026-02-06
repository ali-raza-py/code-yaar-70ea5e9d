import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Users,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  is_disabled: boolean;
  created_at: string;
}

export function UsersAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const toggleUserDisabled = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_disabled: !profile.is_disabled })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `User ${profile.is_disabled ? "enabled" : "disabled"}` });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (u) => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((profile) => (
                <tr key={profile.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{profile.full_name || "No name"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={profile.is_disabled ? "destructive" : "default"}>
                      {profile.is_disabled ? "Disabled" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(profile.created_at || "").toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserDisabled(profile)}
                      disabled={profile.user_id === user?.id}
                    >
                      {profile.is_disabled ? (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ToggleRight className="w-4 h-4 text-primary" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No users found</div>
        )}
      </GlassCard>
    </div>
  );
}
