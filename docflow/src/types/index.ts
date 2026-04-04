import type { Document, DocumentType, User } from "@prisma/client";

export type { Document, DocumentType, User };

export type PDFGenerateRequest = {
  type: DocumentType;
  data: Record<string, unknown>;
};

export type PDFGenerateResponse = {
  fileUrl: string;
  documentId: string;
};

export type DocumentCardProps = {
  document: Document;
  onDelete: (id: string) => void;
  onDownload: (fileUrl: string) => void;
};

export type TemplateType = "INVOICE" | "REPORT" | "CERTIFICATE" | "GRADE_REPORT";

export const TEMPLATE_META: Record<TemplateType, {
  label: string;
  description: string;
  color: string;
}> = {
  INVOICE:      { label: "Invoice",      description: "For billing clients",    color: "blue" },
  REPORT:       { label: "Report",       description: "Business & data reports", color: "purple" },
  CERTIFICATE:  { label: "Certificate",  description: "Awards & completion",    color: "amber" },
  GRADE_REPORT: { label: "Grade Report", description: "Academic records",       color: "green" },
};