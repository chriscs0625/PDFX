"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceData } from "@/schemas/invoice.schema";

interface Props {
  onPreview: (data: InvoiceData) => void;
  onGenerate: (data: InvoiceData) => Promise<void>;
  isGenerating: boolean;
}

export function InvoiceForm({ onPreview, onGenerate, isGenerating }: Props) {
  const form = useForm<InvoiceData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      title: "Invoice", invoiceNo: "", issueDate: "", dueDate: "",
      fromName: "", fromEmail: "", fromAddress: "",
      toName: "", toEmail: "", toAddress: "",
      lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
      currency: "USD", status: "UNPAID", notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lineItems" });

  const onSubmit = (data: InvoiceData) => onGenerate(data);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => onPreview(form.getValues())} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Invoice No</label>
          <input {...form.register("invoiceNo")} className="mt-1 block w-full border p-2" />
        </div>
        <div>
          <label className="block text-sm">Currency</label>
          <select {...form.register("currency")} className="mt-1 block w-full border p-2">
            <option value="USD">USD</option><option value="EUR">EUR</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-bold">Line Items</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input {...form.register(`lineItems.${index}.description`)} placeholder="Item" className="w-1/2 border p-2" />
            <input type="number" {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} placeholder="Qty" className="w-1/4 border p-2" />
            <input type="number" {...form.register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} placeholder="Price" className="w-1/4 border p-2" />
            <button type="button" onClick={() => remove(index)} className="px-2 bg-red-100">X</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })} className="bg-gray-100 px-3 py-1">Add Item</button>
      </div>

      <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white py-2 rounded">
        {isGenerating ? "Generating..." : "Generate & Download"}
      </button>
    </form>
  );
}
