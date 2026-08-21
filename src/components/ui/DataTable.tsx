"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, onRowClick, emptyMessage = "Aucune donnée disponible" }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset pagination if data length shrinks below current page
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  if (data.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[24px] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
      
      {/* Vue Mobile (Cartes) */}
      <div className="md:hidden flex flex-col p-3 gap-3 bg-slate-50/30">
        {paginatedData.map((item, rowIndex) => (
          <div 
            key={rowIndex} 
            onClick={() => onRowClick?.(item)}
            className={`p-4 rounded-[20px] shadow-sm border border-slate-100 flex flex-col gap-3 ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            } ${(item as any).isNew ? 'animate-highlight' : 'bg-white'}`}
          >
            {columns.map((col, colIndex) => {
              const cellContent = col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : null);
              if (!cellContent) return null; // Ne pas afficher les lignes vides sur mobile

              return (
                <div key={colIndex} className={`flex ${col.header ? 'justify-between items-center' : 'justify-end mt-2'} gap-4 border-b border-slate-50 pb-2 last:border-0 last:pb-0`}>
                  {col.header && (
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                      {col.header}
                    </span>
                  )}
                  <div className="text-sm text-slate-900 font-medium text-right break-words truncate max-w-[60%]">
                    {cellContent}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Vue Desktop (Tableau standard) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col, index) => (
                <th key={index} className={`py-4 px-6 text-[13px] font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick?.(item)}
                className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${(item as any).isNew ? 'animate-highlight' : 'bg-white'}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`py-4 px-6 text-sm text-slate-700 ${col.className || ''}`}>
                    {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : null)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-white">
          <div className="text-sm text-slate-500 font-medium">
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, data.length)} sur {data.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-700 mx-2">
              Page {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
