import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { INTERCORRENCIA_OPTIONS } from '../constants';

interface IntercorrenciaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selected: string) => void;
}

export function IntercorrenciaModal({ isOpen, onClose, onSave }: IntercorrenciaModalProps) {
    const [selected, setSelected] = useState(INTERCORRENCIA_OPTIONS[0]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Intercorrência">
          <div className="p-4 w-[400px]">
              <label className="block text-xs font-bold text-slate-700 mb-2">Selecione o Tipo:</label>
              <select 
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs mb-4 text-slate-900"
              >
                  {INTERCORRENCIA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                  <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold border">Cancelar</button>
                  <button onClick={() => onSave(selected)} className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 text-xs font-bold">REGISTRAR</button>
              </div>
          </div>
      </Modal>
    );
}
