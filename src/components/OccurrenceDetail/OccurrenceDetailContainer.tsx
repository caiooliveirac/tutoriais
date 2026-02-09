import React from 'react';
import { OccurrenceDetailProps } from './OccurrenceDetail.types';
import { SidebarInfo } from './SidebarInfo';
import { ActionPanel } from './panels/ActionPanel';
import { ClinicalPanel } from './panels/ClinicalPanel';
import { HistoryPanel } from './panels/HistoryPanel';
import { X } from 'lucide-react';

export function OccurrenceDetailContainer({ viewMode, onClose, data, onReleaseUnit, onUpdateOccurrence, onRemoveOccurrence }: OccurrenceDetailProps) {
  
  const renderPanel = () => {
    switch (viewMode) {
      case 'ACTION':
        return <ActionPanel 
                  onReleaseUnit={() => onReleaseUnit?.(data?.id || '')} 
                  data={data}
                  onClose={onClose}
                  onUpdateOccurrence={onUpdateOccurrence}
                  onRemoveOccurrence={onRemoveOccurrence}
               />;
      case 'CLINICAL':
        return <ClinicalPanel />;
      case 'HISTORY':
        return <HistoryPanel />;
      default:
        return <ActionPanel />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative border-l border-slate-300 shadow-2xl">
      {/* Optional Top Bar for context if needed inside the modal/drawer */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center shrink-0">
          <div className="text-xs font-bold text-slate-700">PROTOCOLO: {data?.protocolo || '2026...'} - DATA: {data?.data} - HORA: {data?.hora}</div>
          {onClose && (
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                <X size={18} />
            </button>
          )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Static Column (30% width approx) */}
        <aside className="w-[300px] shrink-0 h-full overflow-hidden border-r border-slate-200">
           <SidebarInfo data={data} />
        </aside>

        {/* Right Dynamic Column */}
        <main className="flex-1 h-full overflow-hidden bg-white">
           {renderPanel()}
        </main>
      </div>
    </div>
  );
}
