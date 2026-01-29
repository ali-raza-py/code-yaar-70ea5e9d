import { useState, useEffect } from "react";
import { Award, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { CertificateCard } from "./CertificateCard";
import { CertificateTemplate } from "./CertificateTemplate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [samplePreviewOpen, setSamplePreviewOpen] = useState(false);
  const [userName, setUserName] = useState("Your Name");

  useEffect(() => {
    if (user) {
      fetchCertificates();
      fetchUserProfile();
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

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      
      if (data?.full_name) {
        setUserName(data.full_name);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getSampleDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      <>
        <GlassCard className="p-8 text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Certificates Yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Complete courses to earn your certificates. Each certificate comes with a
            unique verification ID.
          </p>
          <Button variant="outline" onClick={() => setSamplePreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            View Sample Certificate
          </Button>
        </GlassCard>

        {/* Sample Certificate Preview Dialog */}
        <Dialog open={samplePreviewOpen} onOpenChange={setSamplePreviewOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Sample Certificate Preview
              </DialogTitle>
              <DialogDescription>
                This is what your certificate will look like when you complete a course.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto border rounded-lg bg-muted/30">
              <div style={{ transform: "scale(0.4)", transformOrigin: "top left", width: "250%", height: "auto" }}>
                <CertificateTemplate
                  studentName={userName}
                  courseName="Introduction to Python Programming"
                  startDate={getSampleDate()}
                  endDate={getSampleDate()}
                  issueDate={getSampleDate()}
                  verificationId="CY-XXXX-XXXX-XXXX"
                />
              </div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">📝 This is a sample preview</p>
              <p>Complete any course to receive your official certificate with a unique verification ID.</p>
            </div>
          </DialogContent>
        </Dialog>
      </>
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
