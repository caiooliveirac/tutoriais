import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { HOSPITALS_SALVADOR } from '../constants';

interface RecursoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { hospital: string; observacao: string }) => void;
}

export function RecursoModal({ isOpen, onClose, onSave }: RecursoModalProps) {
    const [hospital, setHospital] = useState(HOSPITALS_SALVADOR[0]);
    const [observacao, setObservacao] = useState('');

    const handleSave = () => {
        onSave({ hospital, observacao });
        // Reset or keep? Resetting seems appropriate.
        setObservacao('');
        setHospital(HOSPITALS_SALVADOR[0]);
    };

    return (
       <Modal isOpen={isOpen} onClose={onClose} title="Procurar Recurso Assistencial">
          <div className="p-4 w-[500px]">
              <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Unidade Hospitalar Contactada:</label>
                  <select 
                      value={hospital}
                      onChange={e => setHospital(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900"
                  >
                      {HOSPITALS_SALVADOR.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Observações / Resposta:</label>
                <textarea 
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 text-xs min-h-[100px] text-slate-900 resize-none"
                    placeholder="Ex: NEGADA VAGA POR FALTA DE LEITO DE UTI..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                  <button onClick={onClose} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold border">Cancelar</button>
                  <button onClick={handleSave} className="bg-black text-white px-4 py-1.5 rounded hover:bg-zinc-800 text-xs font-bold uppercase">Registrar Contato</button>
              </div>
          </div>
      </Modal>
    );
}
