import React from 'react';
import { Modal } from '../../ui/Modal';

interface RiscoModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentRisk?: string;
    onSave: (risk: string) => void;
}

export function RiscoModal({ isOpen, onClose, currentRisk, onSave }: RiscoModalProps) {
    const risks = [
        { id: 'AZUL', label: 'AZUL - NÃO URGENTE', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
        { id: 'VERDE', label: 'VERDE - POUCO URGENTE', color: 'bg-green-500', hover: 'hover:bg-green-600' },
        { id: 'AMARELO', label: 'AMARELO - URGENTE', color: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
        { id: 'VERMELHO', label: 'VERMELHO - EMERGÊNCIA', color: 'bg-red-500', hover: 'hover:bg-red-600' },
        { id: 'PRETO', label: 'PRETO - ÓBITO', color: 'bg-slate-900', hover: 'hover:bg-slate-950' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Classificação de Risco">
            <div id="risk-selector-modal" className="p-4 grid gap-3">
                {risks.map((r) => (
                    <button
                        key={r.id}
                        id={`btn-risco-${r.id}`}
                        onClick={() => onSave(r.id)}
                        className={`w-full flex items-center p-3 rounded border border-slate-200 transition-colors group hover:bg-slate-50`}
                    >   
                        <div className={`w-8 h-8 rounded-full ${r.color} border-2 border-white shadow-sm mr-4 group-hover:scale-110 transition-transform`}></div>
                        <span className="font-bold text-sm text-slate-700">{r.label}</span>
                    </button>
                ))}
            </div>
        </Modal>
    );
}
