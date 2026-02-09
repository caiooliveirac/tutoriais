import React from 'react';
import { Plus, AlertOctagon, Ban, Hospital as HospitalIcon, XCircle } from 'lucide-react';

interface SimulationControlsProps {
  onAddOccurrence: () => void;
  onLockOccurrence: () => void;
  onEvasion: () => void;
  onQTA: () => void;
  onHospitalFound: () => void;
}

export function SimulationControls({ 
  onAddOccurrence, 
  onLockOccurrence,
  onEvasion, 
  onQTA,
  onHospitalFound 
}: SimulationControlsProps) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white backdrop-blur-md rounded-full px-6 py-3 shadow-2xl border border-slate-700 z-[60] flex items-center gap-4 shadow-blue-900/20">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-r border-slate-700 pr-4 mr-1">
                Simulador v1.0
            </span>
            
            <button id="btn-gerar-ocorrencia" onClick={onAddOccurrence} className="flex items-center gap-2 text-xs font-bold hover:text-green-400 transition-colors uppercase">
                <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white"><Plus size={12} /></div>
                Nova Ocorrência
            </button>

            <button onClick={onLockOccurrence} className="flex items-center gap-2 text-xs font-bold hover:text-red-400 transition-colors uppercase">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-red-600"><Ban size={12} /></div>
                Bloquear
            </button>
            
            <button onClick={onEvasion}  className="flex items-center gap-2 text-xs font-bold hover:text-orange-400 transition-colors uppercase">
                 <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white"><AlertOctagon size={12} /></div>
                 Evasão
            </button>

            <button onClick={onQTA}  className="flex items-center gap-2 text-xs font-bold hover:text-red-400 transition-colors uppercase">
                 <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white"><XCircle size={12} /></div>
                 QTA (Equipe)
            </button>

             <button onClick={onHospitalFound} className="flex items-center gap-2 text-xs font-bold hover:text-cyan-400 transition-colors uppercase pl-2 border-l border-slate-700 ml-2">
                 <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-white"><HospitalIcon size={12} /></div>
                 Definir Vaga
            </button>
        </div>
    )
}
