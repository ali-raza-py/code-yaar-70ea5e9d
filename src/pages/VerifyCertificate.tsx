import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  Loader2,
  Download,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { CertificateTemplate } from "@/components/certificates/CertificateTemplate";
import { useToast } from "@/hooks/use-toast";
import codeYaarLogo from "@/assets/code-yaar-logo-transparent.png";

interface Certificate {
  id: string;
  verification_id: string;
  student_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  issue_date: string;
  is_revoked: boolean;
  revoke_reason?: string;
}

export default function VerifyCertificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    if (!certificateId) return;

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("verification_id", certificateId.toUpperCase())
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setCertificate(data);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async () => {
    if (!certificate) return;
    
    setIsGenerating(true);
    setShowPreview(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html2pdf = (await import("html2pdf.js")).default;

      const element = certificateRef.current;
      if (!element) {
        throw new Error("Certificate element not found");
      }

      const opt = {
        margin: 0,
        filename: `${certificate.course_name.replace(/\s+/g, "-")}-Certificate-${certificate.verification_id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      };

      await html2pdf().set(opt).from(element).save();

      toast({
        title: "Certificate Downloaded",
        description: "The certificate has been saved as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the certificate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setShowPreview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Certificate Not Found
              </h1>
              <p className="text-muted-foreground mb-4">
                The verification ID <span className="font-mono font-semibold">{certificateId}</span> does not match any certificate in our records.
              </p>
              <p className="text-sm text-muted-foreground">
                Please check the ID and try again, or contact support if you believe this is an error.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  if (certificate?.is_revoked) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Certificate Revoked
              </h1>
              <p className="text-muted-foreground mb-4">
                This certificate has been revoked and is no longer valid.
              </p>
              {certificate.revoke_reason && (
                <p className="text-sm text-muted-foreground">
                  Reason: {certificate.revoke_reason}
                </p>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={codeYaarLogo}
              alt="Code-Yaar"
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Certificate Verification
            </h1>
          </div>

          {/* Valid Certificate Card */}
          <GlassCard className="p-8" glow>
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Valid Certificate
              </span>
            </div>

            {/* Certificate Details */}
            <div className="space-y-6">
              {/* Student Name */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Awarded To</p>
                  <p className="text-lg font-semibold text-foreground">
                    {certificate?.student_name}
                  </p>
                </div>
              </div>

              {/* Course Name */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course Completed</p>
                  <p className="text-lg font-semibold text-foreground">
                    {certificate?.course_name}
                  </p>
                </div>
              </div>

              {/* Issue Date */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {certificate && formatDate(certificate.issue_date)}
                  </p>
                </div>
              </div>

              {/* Verification ID */}
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification ID</p>
                  <p className="text-lg font-mono font-semibold text-foreground">
                    {certificate?.verification_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGenerating ? "Generating PDF..." : "Download Certificate PDF"}
              </Button>
            </div>
          </GlassCard>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            This certificate was issued by Code-Yaar and is digitally verifiable.
          </p>
        </motion.div>
      </div>

      {/* Hidden certificate for PDF generation */}
      {showPreview && certificate && (
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            zIndex: -1,
          }}
        >
          <CertificateTemplate
            ref={certificateRef}
            studentName={certificate.student_name}
            courseName={certificate.course_name}
            startDate={formatDate(certificate.start_date)}
            endDate={formatDate(certificate.end_date)}
            issueDate={formatDate(certificate.issue_date)}
            verificationId={certificate.verification_id}
          />
        </div>
      )}
    </div>
  );
}
