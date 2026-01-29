import { useState, useEffect } from "react";
import {
  Award,
  Search,
  Loader2,
  Ban,
  ExternalLink,
  User,
  BookOpen,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Certificate {
  id: string;
  verification_id: string;
  user_id: string;
  student_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  issue_date: string;
  is_revoked: boolean;
  revoke_reason: string | null;
}

export function CertificatesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("issue_date", { ascending: false });

      if (error) {
        console.error("Error fetching certificates:", error);
        toast({
          title: "Error",
          description: "Failed to load certificates",
          variant: "destructive",
        });
        return;
      }

      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setRevokeReason("");
    setRevokeDialogOpen(true);
  };

  const handleRevoke = async () => {
    if (!selectedCertificate || !user) return;

    setIsRevoking(true);
    try {
      const { error } = await supabase
        .from("certificates")
        .update({
          is_revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
          revoke_reason: revokeReason || "No reason provided",
        })
        .eq("id", selectedCertificate.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Certificate Revoked",
        description: `Certificate ${selectedCertificate.verification_id} has been revoked.`,
      });

      setRevokeDialogOpen(false);
      fetchCertificates();
    } catch (error) {
      console.error("Error revoking certificate:", error);
      toast({
        title: "Error",
        description: "Failed to revoke certificate",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.verification_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by ID, name, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {certificates.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Certificates</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {certificates.filter((c) => !c.is_revoked).length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Ban className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {certificates.filter((c) => c.is_revoked).length}
              </p>
              <p className="text-sm text-muted-foreground">Revoked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Verification ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Issue Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCertificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {cert.verification_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cert.student_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cert.course_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(cert.issue_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cert.is_revoked
                          ? "bg-destructive/10 text-destructive"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {cert.is_revoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`/verify/${cert.verification_id}`, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      {!cert.is_revoked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeClick(cert)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCertificates.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "No certificates match your search" : "No certificates issued yet"}
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Revoke Certificate
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this certificate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Certificate ID</p>
                <p className="font-mono font-medium">{selectedCertificate.verification_id}</p>
                <p className="text-sm text-muted-foreground mt-2">Student</p>
                <p className="font-medium">{selectedCertificate.student_name}</p>
                <p className="text-sm text-muted-foreground mt-2">Course</p>
                <p className="font-medium">{selectedCertificate.course_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Reason for revocation (optional)
                </label>
                <Textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Certificate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
