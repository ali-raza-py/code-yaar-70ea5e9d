import { useState, useEffect } from "react";
import { Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { CertificateCard } from "./CertificateCard";

interface Certificate {
  id: string;
  verification_id: string;
  student_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  issue_date: string;
  is_revoked: boolean;
}

export function MyCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issue_date", { ascending: false });

      if (error) {
        console.error("Error fetching certificates:", error);
        return;
      }

      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Certificates Yet
        </h3>
        <p className="text-muted-foreground">
          Complete courses to earn your certificates. Each certificate comes with a
          unique verification ID.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {certificates.map((certificate) => (
        <CertificateCard key={certificate.id} certificate={certificate} />
      ))}
    </div>
  );
}
