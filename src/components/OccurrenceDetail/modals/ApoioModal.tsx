import React from 'react';
import { Modal } from '../../ui/Modal';

interface ApoioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (type: string) => void;
}

export function ApoioModal({ isOpen, onClose, onConfirm }: ApoioModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Apoio à Frota">
            <div className="p-6 grid grid-cols-2 gap-4">
                <button 
                  id="btn-apoio-usa"
                  onClick={() => onConfirm('USA - Avançada')}
                  className="flex flex-col items-center p-6 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors group"
                >
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-200">
                        <span className="font-bold text-lg">USA</span>
                    </div>
                    <span className="font-bold text-slate-700">Apoio Avançado (USA)</span>
                    <span className="text-xs text-slate-500 text-center mt-1">Médico + Enfermeiro + Condutor</span>
                </button>

                <button 
                  id="btn-apoio-usb"
                  onClick={() => onConfirm('USB - Básica')}
                  className="flex flex-col items-center p-6 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-200">
                        <span className="font-bold text-lg">USB</span>
                    </div>
                    <span className="font-bold text-slate-700">Apoio Básico (USB)</span>
                    <span className="text-xs text-slate-500 text-center mt-1">Técnico + Condutor</span>
                </button>
            </div>
        </Modal>
    );
}
