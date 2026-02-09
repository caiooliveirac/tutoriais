import React from 'react';

interface BottomNavProps {
    onSupport: () => void;
    onInfo: () => void;
    onRisk?: () => void;
    onBack?: () => void;
}

export function BottomNav({ onSupport, onInfo, onRisk, onBack }: BottomNavProps) {
  return (
    <div className="bg-slate-50 border-t border-slate-200 p-2 flex gap-2 justify-end">
        {onRisk && (
            <button 
                id="btn-classificacao-risco"
                onClick={onRisk}
                className="min-w-[90px] h-9 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
            >
                Classificação
            </button>
        )}

        <button 
            onClick={onInfo}
            className="min-w-[90px] h-9 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
        >
            Informações
        </button>

        <button 
            id="btn-solicitar-apoio"
            onClick={onSupport}
            className="min-w-[90px] h-9 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
        >
            Solicitar Apoio
        </button>

        <button 
            onClick={onBack}
            className="min-w-[90px] h-9 text-[11px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
        >
            Voltar
        </button>
    </div>
  );
}
