import React from 'react';
import { Modal } from '../../ui/Modal';

interface LigarModalProps {
    isOpen: boolean;
    onClose: () => void;
    solicitante?: string;
}

export function LigarModal({ isOpen, onClose, solicitante }: LigarModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Realizando Chamada">
          <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-6"></div>
              <p className="text-lg font-bold text-slate-800">Conectando chamada com {solicitante || 'Solicitante'}...</p>
              <p className="text-sm text-slate-500 mt-2">Aguarde o estabelecimento da conexão via VOIP.</p>
          </div>
        </Modal>
    );
}
