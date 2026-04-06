"use client";

import React, { useState, useRef } from "react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { ReportForm } from "@/components/forms/ReportForm";
import { CertificateForm } from "@/components/forms/CertificateForm";
import { GradeReportForm } from "@/components/forms/GradeReportForm";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText, Medal, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const documentTypes = [
  {
    type: "INVOICE" as const,
    label: "Invoice",
    desc: "Create professional billing invoices.",
    icon: FileSpreadsheet,
    color: "blue",
    border: "border-t-blue-500",
    glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  },
  {
    type: "REPORT" as const,
    label: "Report",
    desc: "Generate detailed text-based reports.",
    icon: FileText,
    color: "purple",
    border: "border-t-purple-500",
    glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
  },
  {
    type: "CERTIFICATE" as const,
    label: "Certificate",
    desc: "Design beautiful achievement certificates.",
    icon: Medal,
    color: "amber",
    border: "border-t-amber-500",
    glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
  },
  {
    type: "GRADE_REPORT" as const,
    label: "Grade Report",
    desc: "Academic student grade assessments.",
    icon: BookOpen,
    color: "green",
    border: "border-t-green-500",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]",
  },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const [type, setType] = useState<"INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const createMutation = trpc.document.create.useMutation();

  const handleGenerate = async (formData: any) => {
    if (!type) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: formData })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Failed to generate PDF");
      
      await createMutation.mutateAsync({
        type,
        title: formData.title || formData.recipientName || formData.studentName || "Untitled",
        inputData: formData,
        fileUrl: result.fileUrl
      });

      window.open(result.fileUrl, "_blank");
      router.push("/dashboard/history");
    } catch (e: any) {
      console.error(e);
      setGenerateError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useGSAP(() => {
    if (type && formRef.current) {
      gsap.from(formRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.5,
      });
    }
  }, [type]);

  const renderForm = () => {
    const commonProps = { 
      onSubmit: handleGenerate, 
      isGenerating, 
      onPreview: handleGenerate, 
      onGenerate: handleGenerate 
    };
    switch (type) {
      case "INVOICE": return <InvoiceForm {...commonProps} />;
      case "REPORT": return <ReportForm {...commonProps} />;
      case "CERTIFICATE": return <CertificateForm {...commonProps} />;
      case "GRADE_REPORT": return <GradeReportForm {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center pt-8 bg-[#0a0a0a]">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Document</h1>
        <p className="text-gray-400">Select a template to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12 px-4">
        {documentTypes.map((item) => {
          const Icon = item.icon;
          const isSelected = type === item.type;
          
          return (
            <button
              key={item.type}
              onClick={() => { setType(item.type); setGenerateError(null); }}
              className={cn(
                "group relative text-left p-6 rounded-2xl bg-[#1a1a1a] border-t-4 transition-all duration-300",
                item.border,
                item.glow,
                "hover:-translate-y-1 hover:scale-[1.02]",
                isSelected ? "ring-2 ring-white/20 scale-[1.02] shadow-xl" : "border-x border-b border-x-white/5 border-b-white/5 opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl bg-white/5 transition-colors",
                  `text-${item.color}-500 group-hover:bg-${item.color}-500/10`
                )}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-white transition-colors">{item.label}</h3>
                  <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {type && (
        <div ref={formRef} className="form-container w-full max-w-2xl px-4 pb-20">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              {documentTypes.find(d => d.type === type)?.label} Details
            </h2>
            {generateError && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-medium text-sm text-center">
                {generateError}
              </div>
            )}
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
}
