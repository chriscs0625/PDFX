import React from "react";
import type { Document } from "@prisma/client";
import { format } from "date-fns";

export function DocumentCard({ doc, onDelete, onDownload }: { doc: Document, onDelete: (id: string) => void, onDownload: (url: string) => void }) {
  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 mb-2 inline-block object-contain">
            {doc.type}
          </span>
          <h3 className="font-bold text-gray-900 truncate" title={doc.title}>{doc.title}</h3>
          <p className="text-xs text-gray-500 mt-1">Created: {format(new Date(doc.createdAt), "MMM d, yyyy")}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => doc.fileUrl && onDownload(doc.fileUrl)} disabled={!doc.fileUrl} className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-1.5 text-sm rounded hover:bg-blue-100 transition disabled:opacity-50">
          Preview
        </button>
        <button onClick={() => onDelete(doc.id)} className="w-10 bg-red-50 text-red-600 border border-red-200 py-1.5 text-sm rounded hover:bg-red-100 transition flex items-center justify-center">
          X
        </button>
      </div>
    </div>
  );
}