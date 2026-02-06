import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CoursesAdminNew } from "@/components/admin/CoursesAdminNew";
import { DSAAdmin } from "@/components/admin/DSAAdmin";
import { CertificatesAdmin } from "@/components/admin/CertificatesAdmin";
import { AIToolsAdmin } from "@/components/admin/AIToolsAdmin";
import { ResourcesAdmin } from "@/components/admin/ResourcesAdmin";
import { HelpFAQAdmin } from "@/components/admin/HelpFAQAdmin";
import { UserProgressAdmin } from "@/components/admin/UserProgressAdmin";
import { AdminLeaderboard } from "@/components/admin/AdminLeaderboard";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export default function Admin() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

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

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "all-courses":
      case "create-course":
      case "sections":
      case "lessons":
        return <CoursesAdminNew />;
      case "dsa":
        return <DSAAdmin />;
      case "all-users":
        return <UsersAdmin />;
      case "progress":
        return <UserProgressAdmin />;
      case "leaderboard":
        return <AdminLeaderboard />;
      case "certificates":
        return <CertificatesAdmin />;
      case "ai-tools":
        return <AIToolsAdmin />;
      case "resources":
        return <ResourcesAdmin />;
      case "help-faq":
        return <HelpFAQAdmin />;
      case "settings":
        return (
          <div className="text-center py-16 text-muted-foreground">
            Settings coming soon...
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {renderContent()}
    </AdminLayout>
  );
}
