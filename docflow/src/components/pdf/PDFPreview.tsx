"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { InvoiceData } from "@/schemas/invoice.schema";
import { ReportData } from "@/schemas/report.schema";
import { CertificateData } from "@/schemas/certificate.schema";
import { GradeReportData } from "@/schemas/grade-report.schema";

const InvoicePDF = dynamic(() => import("./InvoicePDF").then(m => m.InvoicePDF), { ssr: false });
const ReportPDF = dynamic(() => import("./ReportPDF").then(m => m.ReportPDF), { ssr: false });
const CertificatePDF = dynamic(() => import("./CertificatePDF").then(m => m.CertificatePDF), { ssr: false });
const GradeReportPDF = dynamic(() => import("./GradeReportPDF").then(m => m.GradeReportPDF), { ssr: false });
const PDFViewer = dynamic(() => import("@react-pdf/renderer").then(m => m.PDFViewer), { ssr: false });

interface PDFPreviewProps {
  type: "INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT";
  data: any;
}

export function PDFPreview({ type, data }: PDFPreviewProps) {
  const [isClient, setIsClient] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="w-full h-[600px] animate-pulse bg-gray-200 rounded-md" />;

  const renderDocument = () => {
    switch (type) {
      case "INVOICE": return <InvoicePDF data={data as InvoiceData} />;
      case "REPORT": return <ReportPDF data={data as ReportData} />;
      case "CERTIFICATE": return <CertificatePDF data={data as CertificateData} />;
      case "GRADE_REPORT": return <GradeReportPDF data={data as GradeReportData} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button 
          onClick={() => setKey(k => k + 1)}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Refresh preview
        </button>
      </div>
      <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
        {(() => {
          const doc = renderDocument();
          return doc ? (
            <PDFViewer key={key} width="100%" height="100%" className="border-0">
              {doc as any}
            </PDFViewer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Invalid Document Type</div>
          );
        })()}
      </div>
    </div>
  );
}
