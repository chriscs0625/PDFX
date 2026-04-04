"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gradeReportSchema, GradeReportData } from "@/schemas/grade-report.schema";

interface Props {
  onPreview: (data: GradeReportData) => void;
  onGenerate: (data: GradeReportData) => Promise<void>;
  isGenerating: boolean;
}

export function GradeReportForm({ onPreview, onGenerate, isGenerating }: Props) {
  const form = useForm<GradeReportData>({
    resolver: zodResolver(gradeReportSchema),
    defaultValues: {
      studentName: "", studentId: "", institution: "", term: "", year: "",
      grades: [{ subject: "", grade: "", score: 0 }],
      gpa: 0, remarks: ""
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "grades" });

  return (
    <form onSubmit={form.handleSubmit(onGenerate)} onChange={() => onPreview(form.getValues())} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><label>Student Name</label><input {...form.register("studentName")} className="w-full border p-2" /></div>
        <div><label>Student ID</label><input {...form.register("studentId")} className="w-full border p-2" /></div>
        <div><label>Institution</label><input {...form.register("institution")} className="w-full border p-2" /></div>
        <div><label>Term</label><input {...form.register("term")} className="w-full border p-2" /></div>
        <div><label>Year</label><input {...form.register("year")} className="w-full border p-2" /></div>
        <div><label>GPA</label><input type="number" step="0.01" {...form.register("gpa", { valueAsNumber: true })} className="w-full border p-2" /></div>
      </div>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input {...form.register(`grades.${index}.subject`)} placeholder="Subject" className="w-1/3 border p-2" />
            <input {...form.register(`grades.${index}.grade`)} placeholder="Grade" className="w-1/4 border p-2" />
            <input type="number" {...form.register(`grades.${index}.score`, { valueAsNumber: true })} placeholder="Score" className="w-1/4 border p-2" />
            <button type="button" onClick={() => remove(index)} className="px-2 bg-red-100">X</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ subject: "", grade: "", score: 0 })} className="bg-gray-100 px-3 py-1">Add Grade</button>
      </div>
      <div><label>Remarks</label><textarea {...form.register("remarks")} className="w-full border p-2" /></div>
      <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white py-2">Generate</button>
    </form>
  );
}