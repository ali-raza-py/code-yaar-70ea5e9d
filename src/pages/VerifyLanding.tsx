import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import codeYaarLogo from "@/assets/code-yaar-logo-transparent.png";

export default function VerifyLanding() {
  const navigate = useNavigate();
  const [verificationId, setVerificationId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = verificationId.trim().toUpperCase();
    if (cleanId) {
      navigate(`/verify/${cleanId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto">
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Certificate Verification
            </h1>
            <p className="text-muted-foreground">
              Verify the authenticity of any Code-Yaar certificate
            </p>
          </div>

          {/* Verification Form */}
          <GlassCard className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="verificationId" className="block text-sm font-medium mb-2 text-foreground">
                  Verification ID
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="verificationId"
                    type="text"
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    placeholder="e.g., CY-ABCD-1234-EFGH"
                    className="pl-10 font-mono uppercase"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the verification ID found at the bottom of the certificate
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!verificationId.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Verify Certificate
              </Button>
            </form>
          </GlassCard>

          {/* Info Section */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Each Code-Yaar certificate contains a unique verification ID in the format{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">CY-XXXX-XXXX-XXXX</code>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
