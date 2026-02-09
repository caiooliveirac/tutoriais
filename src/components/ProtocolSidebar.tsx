"use client";

import { motion } from 'framer-motion';
import { Book, AlertCircle, Scale, ShieldAlert, ChevronRight, Activity } from 'lucide-react';
import { Protocol } from '../data/protocols';

interface ProtocolSidebarProps {
  protocols: Protocol[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ProtocolSidebar({ protocols, selectedId, onSelect }: ProtocolSidebarProps) {
  
  // Group protocols by category
  const grouped = protocols.reduce((acc, protocol) => {
    if (!acc[protocol.category]) acc[protocol.category] = [];
    acc[protocol.category].push(protocol);
    return acc;
  }, {} as Record<string, Protocol[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
        case "Fluxo Padrão": return <Activity size={16} />;
        case "Intercorrências": return <AlertCircle size={16} />;
        case "Jurídico/Administrativo": return <Scale size={16} />;
        default: return <Book size={16} />;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 h-[calc(100vh-64px)] overflow-y-auto border-r border-slate-800 flex flex-col shadow-xl">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <h2 className="text-slate-100 font-bold text-sm tracking-wider uppercase flex items-center gap-2">
            <Book size={18} className="text-blue-500" />
            Protocolos
        </h2>
        <p className="text-slate-500 text-[10px] mt-1">Guia Rápido de Condutas</p>
      </div>

      <div className="p-3 space-y-6">
        {Object.keys(grouped).map((category) => (
            <div key={category}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                   {getCategoryIcon(category)} {category}
                </h3>
                <div className="space-y-1">
                    {grouped[category].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group
                                ${selectedId === item.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <span className="relative z-10 flex justify-between items-center">
                                {item.title}
                                {selectedId === item.id && <ChevronRight size={14} />}
                            </span>
                            {selectedId === item.id && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-blue-600 rounded-lg -z-0"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        ))}
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-800">
         <div className="bg-slate-800/50 rounded p-3 border border-slate-700">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-bold uppercase">Importante</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
                Estes protocolos servem como guia. A soberania médica prevalece em situações atípicas.
            </p>
         </div>
      </div>
    </aside>
  );
}
