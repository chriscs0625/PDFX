import React from 'react';
import { FileText, FileSpreadsheet, Medal, BookOpen, Download, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentType } from '@prisma/client';

interface DocumentCardProps {
  id: string;
  title: string;
  type: DocumentType;
  createdAt: Date;
  fileUrl?: string | null;
}

const typeConfig = {
  [DocumentType.INVOICE]: { icon: FileSpreadsheet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  [DocumentType.REPORT]: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  [DocumentType.CERTIFICATE]: { icon: Medal, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  [DocumentType.GRADE_REPORT]: { icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
};

export const DocumentCard = ({ id, title, type, createdAt, fileUrl }: DocumentCardProps) => {
  const config = typeConfig[type] || typeConfig[DocumentType.REPORT];
  const Icon = config.icon;

  return (
    <div className="flex flex-col rounded-2xl bg-[#1a1a1a] border border-white/10 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <Icon className={cn("w-6 h-6", config.color)} />
        </div>
        <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", config.bg, config.color)}>
          {type.replace('_', ' ')}
        </span>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1 truncate" title={title}>
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          onClick={() => fileUrl ? window.open(fileUrl, '_blank') : alert('View not implemented yet')}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};