import React from 'react';

interface OccurrenceTableProps {
  title: string;
  headers: { label: string; className?: string; id?: string }[];
  gridColsClass: string;
  children: React.ReactNode;
}

export function OccurrenceTable({ title, headers, gridColsClass, children }: OccurrenceTableProps) {
  return (
    <section className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="px-4 pt-3 pb-0">
        <h2 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-1">{title}</h2>
        <div className="h-[2px] w-full bg-orange-500 mb-2"></div>
      </div>
      
      {/* Header Row */}
      <div className={`grid ${gridColsClass} gap-2 px-2 py-2 border-b border-slate-300 bg-white text-[10px] font-bold text-slate-500 uppercase tracking-tight items-end`}>
        {headers.map((h, i) => (
          <div key={i} id={h.id} className={h.className || ''}>
            {h.label}
          </div>
        ))}
      </div>

      <div className="divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}
