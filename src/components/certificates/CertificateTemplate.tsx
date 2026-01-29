import { forwardRef } from "react";
import codeYaarLogo from "@/assets/code-yaar-logo-transparent.png";

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  verificationId: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, startDate, endDate, issueDate, verificationId }, ref) => {
    return (
      <div
        ref={ref}
        className="certificate-container"
        style={{
          width: "297mm",
          height: "210mm",
          padding: "20mm",
          backgroundColor: "#ffffff",
          border: "2px solid #1a1a1a",
          position: "relative",
          fontFamily: "'Inter', 'Poppins', 'Montserrat', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Inner decorative border */}
        <div
          style={{
            position: "absolute",
            top: "10mm",
            left: "10mm",
            right: "10mm",
            bottom: "10mm",
            border: "1px solid #e5e5e5",
            pointerEvents: "none",
          }}
        />

        {/* Header with logos */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "15mm",
          }}
        >
          {/* Code-Yaar Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={codeYaarLogo}
              alt="Code-Yaar"
              style={{ height: "40px", width: "auto" }}
              crossOrigin="anonymous"
            />
          </div>

          {/* Lovable Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
                fill="#FFD700"
              />
              <path
                d="M16 8L18.5 13H23.5L19.5 16.5L21 22L16 18.5L11 22L12.5 16.5L8.5 13H13.5L16 8Z"
                fill="#1a1a1a"
              />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              Powered by Lovable
            </span>
          </div>
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: "center", marginBottom: "12mm" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            Certificate of Completion
          </h1>
          <div
            style={{
              width: "80px",
              height: "4px",
              backgroundColor: "#FFD700",
              margin: "12px auto 0",
            }}
          />
        </div>

        {/* This is to certify text */}
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666666",
            margin: "0 0 8mm 0",
            letterSpacing: "1px",
          }}
        >
          This is to certify that
        </p>

        {/* Student Name */}
        <div style={{ textAlign: "center", marginBottom: "8mm" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#1a1a1a",
              margin: 0,
              borderBottom: "2px solid #FFD700",
              display: "inline-block",
              padding: "0 40px 8px",
            }}
          >
            {studentName}
          </h2>
        </div>

        {/* Has successfully completed */}
        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#666666",
            margin: "0 0 8mm 0",
            letterSpacing: "1px",
          }}
        >
          has successfully completed the course
        </p>

        {/* Course Name */}
        <div style={{ textAlign: "center", marginBottom: "10mm" }}>
          <h3
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#1a1a1a",
              margin: 0,
              backgroundColor: "#f8f8f8",
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "4px",
            }}
          >
            {courseName}
          </h3>
        </div>

        {/* Dates */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "40px",
            marginBottom: "15mm",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#888888", display: "block" }}>
              Start Date
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              {startDate}
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#888888", display: "block" }}>
              Completion Date
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              {endDate}
            </span>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#888888", display: "block" }}>
              Issue Date
            </span>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              {issueDate}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "12mm",
          }}
        >
          <div style={{ textAlign: "center", width: "180px" }}>
            <div
              style={{
                borderBottom: "1px solid #1a1a1a",
                marginBottom: "8px",
                height: "40px",
              }}
            />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              Ali Raza
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#666666" }}>
              Founder & CEO
            </p>
          </div>
          <div style={{ textAlign: "center", width: "180px" }}>
            <div
              style={{
                borderBottom: "1px solid #1a1a1a",
                marginBottom: "8px",
                height: "40px",
              }}
            />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1a1a1a" }}>
              Abdullah
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#666666" }}>
              Chief Technology Officer
            </p>
          </div>
        </div>

        {/* Footer with verification ID */}
        <div
          style={{
            position: "absolute",
            bottom: "15mm",
            left: "20mm",
            right: "20mm",
            textAlign: "center",
            borderTop: "1px solid #e5e5e5",
            paddingTop: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "11px", color: "#888888" }}>
            Certificate Verification ID:{" "}
            <span style={{ fontWeight: 600, color: "#1a1a1a", letterSpacing: "1px" }}>
              {verificationId}
            </span>
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#aaaaaa" }}>
            Verify at: code-yaar.lovable.app/verify/{verificationId}
          </p>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";
