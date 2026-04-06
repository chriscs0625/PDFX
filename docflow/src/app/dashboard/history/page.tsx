"use client";

import React, { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Search, Download, History as HistoryIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function HistoryPage() {
  const { data: documents, isLoading } = trpc.document.list.useQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const listRef = useRef<HTMLDivElement>(null);

  const filteredDocs = documents?.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  useGSAP(() => {
    if (filteredDocs && filteredDocs.length > 0 && listRef.current) {
      gsap.from(listRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
      });
    }
  }, [filteredDocs?.length, typeFilter]); // Re-run when length or filter changes

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading document history...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-8">Document History</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="ALL">All Types</option>
            <option value="INVOICE">Invoice</option>
            <option value="REPORT">Report</option>
            <option value="CERTIFICATE">Certificate</option>
            <option value="GRADE_REPORT">Grade Report</option>
          </select>
        </div>
      </div>

      {!filteredDocs || filteredDocs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-80">
          <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <HistoryIcon className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
          <p className="text-gray-400 text-center max-w-sm">
            {documents?.length === 0
              ? "You haven't created any documents yet."
              : "No documents match your chosen search and filters."}
          </p>
        </div>
      ) : (
        <div ref={listRef} className="flex flex-col gap-3">
          {filteredDocs.map((doc: any) => {
            let colorClass = "text-gray-400 bg-gray-400/10";
            if (doc.type === "INVOICE") colorClass = "text-blue-500 bg-blue-500/10";
            if (doc.type === "REPORT") colorClass = "text-purple-500 bg-purple-500/10";
            if (doc.type === "CERTIFICATE") colorClass = "text-amber-500 bg-amber-500/10";
            if (doc.type === "GRADE_REPORT") colorClass = "text-green-500 bg-green-500/10";

            return (
              <div
                key={doc.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-all hover:bg-white/5"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate mb-1" title={doc.title}>{doc.title}</h4>
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span>
                      {new Date(doc.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap", colorClass)}>
                    {doc.type.replace('_', ' ')}
                  </span>
                  
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Download/View PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center opacity-30 cursor-not-allowed">
                      <Download className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}