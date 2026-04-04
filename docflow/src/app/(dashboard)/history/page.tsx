"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { DocumentCard } from "@/components/ui/DocumentCard";

export default function HistoryPage() {
  const { data: documents, isLoading, refetch } = trpc.document.list.useQuery();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const deleteMutation = trpc.document.delete.useMutation({
    onSuccess: () => refetch()
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  if (isLoading) return <div>Loading history...</div>;

  const filtered = documents?.filter(d => 
    (filter === "ALL" || d.type === filter) &&
    (d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Document History</h1>
      
      <div className="flex gap-4">
        <input 
          placeholder="Search items..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="border border-gray-300 rounded px-4 py-2 flex-grow"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded px-4 py-2">
          <option value="ALL">All Types</option>
          <option value="INVOICE">Invoices</option>
          <option value="REPORT">Reports</option>
          <option value="CERTIFICATE">Certificates</option>
          <option value="GRADE_REPORT">Grade Reports</option>
        </select>
      </div>

      {!filtered || filtered.length === 0 ? (
        <div className="text-center py-20 border rounded-lg text-gray-500">No documents found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(doc => (
            <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  );
}