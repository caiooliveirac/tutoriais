import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (text: string) => void;
}

export function InfoModal({ isOpen, onClose, onSave }: InfoModalProps) {
    const [text, setText] = useState('');

    const handleSave = () => {
        if (!text.trim()) return;
        onSave(text);
        setText('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inserir Informações Adicionais">
            <div className="p-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Registro de Ocorrência (Log)</label>
                <textarea 
                    className="w-full h-32 border border-slate-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-slate-900"
                    placeholder="Digite informações relevantes para o histórico desta ocorrência..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-4">
                     <div className="text-xs text-slate-500 flex items-center gap-1">
                         <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                         Salvo localmente
                     </div>
                     <div className="flex gap-2">
                          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium text-sm">Cancelar</button>
                          <button onClick={handleSave} className="bg-[#4aafb9] hover:bg-[#3a9aa3] text-white px-6 py-2 rounded shadow-sm font-bold text-sm">
                              Registrar
                          </button>
                     </div>
                </div>
            </div>
        </Modal>
    );
}
