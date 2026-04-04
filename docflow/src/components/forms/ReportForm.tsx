"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, ReportData } from "@/schemas/report.schema";

interface Props {
  onPreview: (data: ReportData) => void;
  onGenerate: (data: ReportData) => Promise<void>;
  isGenerating: boolean;
}

export function ReportForm({ onPreview, onGenerate, isGenerating }: Props) {
  const form = useForm<ReportData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "", subtitle: "", author: "", date: "",
      sections: [{ heading: "", body: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "sections" });

  return (
    <form onSubmit={form.handleSubmit(onGenerate)} onChange={() => onPreview(form.getValues())} className="space-y-6">
      <div>
        <label>Title</label>
        <input {...form.register("title")} className="block w-full border p-2" />
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-4">
            <input {...form.register(`sections.${index}.heading`)} placeholder="Heading" className="block w-full border p-2 mb-2" />
            <textarea {...form.register(`sections.${index}.body`)} placeholder="Body" className="block w-full border p-2" />
          </div>
        ))}
        <button type="button" onClick={() => append({ heading: "", body: "" })} className="bg-gray-100 px-3 py-1">Add Section</button>
      </div>
      <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white py-2">Generate</button>
    </form>
  );
}
