"use client";

import React, { useState } from "react";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { ReportForm } from "@/components/forms/ReportForm";
import { CertificateForm } from "@/components/forms/CertificateForm";
import { GradeReportForm } from "@/components/forms/GradeReportForm";
import { PDFPreview } from "@/components/pdf/PDFPreview";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";

export default function NewDocumentPage() {
  const router = useRouter();
  const [type, setType] = useState<"INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT" | null>(null);
  const [data, setData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const createMutation = trpc.document.create.useMutation({
    onSuccess: () => {
      router.push("/history");
    }
  });

  const handleGenerate = async (formData: any) => {
    if (!type) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: formData })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      await createMutation.mutateAsync({
        type,
        title: formData.title || formData.recipientName || formData.studentName || "Untitiled",
        inputData: formData,
        fileUrl: result.fileUrl
      });

      window.open(result.fileUrl, "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!type) {
    return (
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-10">
        <button onClick={() => setType("INVOICE")} className="p-6 border rounded-lg text-center bg-blue-50">INVOICE</button>
        <button onClick={() => setType("REPORT")} className="p-6 border rounded-lg text-center bg-purple-50">REPORT</button>
        <button onClick={() => setType("CERTIFICATE")} className="p-6 border rounded-lg text-center bg-yellow-50">CERTIFICATE</button>
        <button onClick={() => setType("GRADE_REPORT")} className="p-6 border rounded-lg text-center bg-green-50">GRADE REPORT</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="border border-gray-200 p-6 rounded-lg bg-white overflow-y-auto" style={{ maxHeight: "80vh" }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{type}</h2>
          <button onClick={() => setType(null)} className="text-sm text-blue-500">Back</button>
        </div>
        {type === "INVOICE" && <InvoiceForm onPreview={setData} onGenerate={handleGenerate} isGenerating={isGenerating} />}
        {type === "REPORT" && <ReportForm onPreview={setData} onGenerate={handleGenerate} isGenerating={isGenerating} />}
        {type === "CERTIFICATE" && <CertificateForm onPreview={setData} onGenerate={handleGenerate} isGenerating={isGenerating} />}
        {type === "GRADE_REPORT" && <GradeReportForm onPreview={setData} onGenerate={handleGenerate} isGenerating={isGenerating} />}
      </div>
      <div>
        <PDFPreview type={type} data={data} />
      </div>
    </div>
  );
}
