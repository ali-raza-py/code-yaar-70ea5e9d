import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface IssueCertificateParams {
  courseId: string;
  courseName: string;
  studentName: string;
  startDate: Date;
  endDate: Date;
}

export function useCertificates() {
  const { user } = useAuth();
  const { toast } = useToast();

  const issueCertificate = async ({
    courseId,
    courseName,
    studentName,
    startDate,
    endDate,
  }: IssueCertificateParams) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to receive a certificate",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Use the database function to issue certificate
      const { data, error } = await supabase.rpc("issue_certificate", {
        p_user_id: user.id,
        p_course_id: courseId,
        p_student_name: studentName,
        p_course_name: courseName,
        p_start_date: startDate.toISOString().split("T")[0],
        p_end_date: endDate.toISOString().split("T")[0],
      });

      if (error) {
        throw error;
      }

      toast({
        title: "🎉 Certificate Earned!",
        description: `Congratulations! You've earned a certificate for completing ${courseName}.`,
      });

      return data;
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast({
        title: "Error",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const checkExistingCertificate = async (courseId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error checking certificate:", error);
      return null;
    }
  };

  return {
    issueCertificate,
    checkExistingCertificate,
  };
}
