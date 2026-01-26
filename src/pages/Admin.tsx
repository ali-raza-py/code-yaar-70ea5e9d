import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResourcesAdmin } from "@/components/admin/ResourcesAdmin";
import { HelpFAQAdmin } from "@/components/admin/HelpFAQAdmin";
import {
  Shield,
  Users,
  FileText,
  Search,
  Loader2,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type Tab = "users" | "resources" | "help";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  is_disabled: boolean;
  created_at: string;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("resources");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (isAdmin && activeTab === "users") {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin, activeTab]);

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Dashboard</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Manage <span className="text-gradient">Code-Yaar</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage resources, users, and help content
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "resources"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <FileText className="w-4 h-4" />
            Resources
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "help"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Help & FAQ
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </button>
        </div>

        {/* Content */}
        {activeTab === "resources" && <ResourcesAdmin />}
        
        {activeTab === "help" && <HelpFAQAdmin />}

        {activeTab === "users" && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                            <span className="font-medium">{profile.full_name || "No name"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                profile.is_disabled
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {profile.is_disabled ? "Disabled" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
