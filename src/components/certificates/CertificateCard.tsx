import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { CertificateTemplate } from "./CertificateTemplate";
import { useToast } from "@/hooks/use-toast";

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

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setShowPreview(true);

    try {
      // Wait for the certificate to render
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
        description: "Your certificate has been saved as a PDF.",
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

  const handleViewVerification = () => {
    window.open(`/verify/${certificate.verification_id}`, "_blank");
  };

  if (certificate.is_revoked) {
    return (
      <GlassCard className="p-6 opacity-60">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10">
            <Award className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground line-through">
              {certificate.course_name}
            </h3>
            <p className="text-sm text-destructive">Certificate Revoked</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <Award className="w-8 h-8 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {certificate.course_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>Issued on {formatDate(certificate.issue_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary mt-2">
                <CheckCircle className="w-3 h-3" />
                <span className="font-mono">{certificate.verification_id}</span>
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col">
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewVerification}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Hidden certificate for PDF generation */}
      {showPreview && (
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
    </>
  );
}
