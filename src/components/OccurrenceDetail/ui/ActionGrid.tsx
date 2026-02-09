import React from 'react';
import { Phone, LogOut, ArrowRightLeft, UserPlus } from 'lucide-react';

interface ActionGridProps {
    onCall: () => void;
    onRelease: () => void;
    onChangeUnit?: () => void;
    onInsertVictim: () => void;
}

export function ActionGrid({ onCall, onRelease, onChangeUnit, onInsertVictim }: ActionGridProps) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-2 p-1 overflow-x-auto">
        <button 
            id="btn-ligar-regulacao"
            onClick={onCall}
            className="flex items-center justify-center gap-2 bg-[#1e2a4a] hover:bg-[#151d33] text-white h-11 px-3 rounded shadow-sm border-b-4 border-[#0f1526] active:border-b-0 active:translate-y-1 transition-all"
        >
            <Phone size={16} fill="currentColor" />
            <div className="text-left leading-tight">
                <div className="font-bold text-[11px]">Ligar</div>
                <div className="text-[9px] opacity-70">Solicitante</div>
            </div>
        </button>

        <button 
            onClick={onRelease}
            id="btn-liberar-unidade"
            className="flex items-center justify-center gap-2 bg-[#5cb85c] hover:bg-[#4cae4c] text-white h-11 px-3 rounded shadow-sm border-b-4 border-[#398439] active:border-b-0 active:translate-y-1 transition-all"
        >
            <LogOut size={16} />
            <span className="font-bold text-[11px]">Liberar Unidade</span>
        </button>

        <button 
            onClick={onChangeUnit}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 h-11 px-3 rounded shadow-sm border border-slate-300 border-b-4 border-slate-300 active:border-b active:translate-y-1 transition-all"
        >
            <ArrowRightLeft size={16} />
            <span className="font-bold text-[11px]">Troca de Unidade</span>
        </button>

        <button 
            onClick={onInsertVictim}
            id="btn-encerrar-regulacao"
            className="flex items-center justify-center gap-2 bg-[#0066cc] hover:bg-[#0052a3] text-white h-11 px-3 rounded shadow-sm border-b-4 border-[#004080] active:border-b-0 active:translate-y-1 transition-all"
        >
            <UserPlus size={16} />
            <span className="font-bold text-[11px]">Inserir Vítima</span>
        </button>
    </div>
  );
}
