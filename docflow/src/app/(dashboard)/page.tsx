"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { DocumentCard } from "@/components/DocumentCard";
import { Plus, FileX } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function DashboardPage() {
  const { data: documents, isLoading } = trpc.document.list.useQuery();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (documents && documents.length > 0 && containerRef.current) {
      gsap.from(containerRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });
    }
  }, [documents]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading your documents...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">My Documents</h1>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          New Document
        </Link>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-80">
          <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <FileX className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-gray-400 mb-8 max-w-sm text-center">
            You haven't created any documents. Get started by creating your first invoice, report or certificate.
          </p>
          <Link
            href="/dashboard/new"
            className="px-6 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            Create your first document
          </Link>
        </div>
      ) : (
        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(documents as any[]).map((doc: any) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              type={doc.type}
              createdAt={doc.createdAt}
              fileUrl={doc.fileUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
