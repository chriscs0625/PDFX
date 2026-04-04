"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { DocumentCard } from "@/components/ui/DocumentCard";

export default function DashboardPage() {
  const { data: documents, isLoading } = trpc.document.list.useQuery();

  if (isLoading) return <div>Loading documents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <Link href="/new" className="px-4 py-2 bg-blue-600 text-white rounded">New Document</Link>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <p className="text-gray-500 mb-4">No documents yet.</p>
          <Link href="/new" className="px-4 py-2 bg-blue-600 text-white rounded">Create your first document</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(documents as any[]).map((doc: any) => (
            <DocumentCard key={doc.id} doc={doc} onDelete={() => {}} onDownload={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
