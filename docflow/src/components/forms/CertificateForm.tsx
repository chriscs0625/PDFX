"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificateSchema, CertificateData } from "@/schemas/certificate.schema";

interface Props {
  onPreview: (data: CertificateData) => void;
  onGenerate: (data: CertificateData) => Promise<void>;
  isGenerating: boolean;
}

export function CertificateForm({ onPreview, onGenerate, isGenerating }: Props) {
  const form = useForm<CertificateData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      recipientName: "", courseName: "", issuerName: "", issuerTitle: "",
      issueDate: "", certificateId: "", description: ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onGenerate)} onChange={() => onPreview(form.getValues())} className="space-y-6">
      <div><label>Recipient Name</label><input {...form.register("recipientName")} className="w-full border p-2" /></div>
      <div><label>Course Name</label><input {...form.register("courseName")} className="w-full border p-2" /></div>
      <div><label>Issuer Name</label><input {...form.register("issuerName")} className="w-full border p-2" /></div>
      <div><label>Issuer Title</label><input {...form.register("issuerTitle")} className="w-full border p-2" /></div>
      <div><label>Issue Date</label><input {...form.register("issueDate")} type="date" className="w-full border p-2" /></div>
      <div><label>Certificate ID</label><input {...form.register("certificateId")} className="w-full border p-2" /></div>
      <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white py-2">Generate</button>
    </form>
  );
}
