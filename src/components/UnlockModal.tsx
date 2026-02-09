import React from 'react';
import { ShieldCheck, Lock, Unlock } from 'lucide-react';
import { TriagemData } from '../types';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedItems: TriagemData[];
  onUnlock: (id: string) => void;
}

export function UnlockModal({ isOpen, onClose, lockedItems, onUnlock }: UnlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
           <h2 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
               <ShieldCheck size={18} className="text-green-400"/> Admin: Desbloqueio de Ocorrências
           </h2>
           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xs uppercase font-bold">
               Fechar [X]
           </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-50 min-h-[200px]">
           {lockedItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                   <ShieldCheck size={48} className="mb-2 opacity-20"/>
                   <p className="text-sm font-medium">Nenhuma ocorrência bloqueada no momento.</p>
               </div>
           ) : (
               <div className="space-y-3">
                   <p className="text-xs text-slate-500 mb-4 bg-yellow-100 border border-yellow-200 p-2 rounded">
                       Atenção: Estas ocorrências estão marcadas como "Em Uso" por outro operador. O desbloqueio forçado pode causar conflitos de edição.
                   </p>
                   {lockedItems.map(item => (
                       <div key={item.id} className="bg-white border border-slate-200 p-3 rounded shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                           <div>
                               <div className="font-bold text-slate-800 text-sm">{item.protocolo}</div>
                               <div className="text-[10px] text-slate-500">Médico: {item.medico}</div>
                           </div>
                           
                           <button 
                             onClick={() => onUnlock(item.id)}
                             className="bg-slate-100 hover:bg-green-600 hover:text-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-2"
                           >
                               <Unlock size={14} /> Desbloquear
                           </button>
                       </div>
                   ))}
               </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-100 px-4 py-3 flex justify-end border-t border-slate-200">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded text-xs font-bold uppercase text-slate-600 hover:bg-slate-50">
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
}
