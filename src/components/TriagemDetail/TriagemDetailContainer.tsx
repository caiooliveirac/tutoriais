import React from 'react';
import { X } from 'lucide-react';
import { TriagemData } from '../../types';
import { TriagemSidebarInfo } from './TriagemSidebarInfo';
import { TriagemPanel } from './TriagemPanel';

interface TriagemDetailContainerProps {
  data: TriagemData;
  onClose: () => void;
  onUpdateTriagem: (id: string, updates: Partial<TriagemData>) => void;
  onRemoveTriagem: (id: string) => void;
}

export function TriagemDetailContainer({ data, onClose, onUpdateTriagem, onRemoveTriagem }: TriagemDetailContainerProps) {
  const handleSave = (payload: { hma: string; tipoOcorrencia: string; motivo: string; detalhamento: string; risco: TriagemData['risco']; decisaoMedica: string; unidadeSolicitada: string }) => {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (payload.decisaoMedica !== 'ENVIO DE UNIDADE MÓVEL') {
      onRemoveTriagem(data.id);
      return;
    }

    onUpdateTriagem(data.id, {
      hma: payload.hma,
      statusBadge: 'SOLICITADO_ENVIO',
      solicitadoHora: time,
      statusIcon: 'check',
      risco: payload.risco,
      tipoOcorrencia: payload.tipoOcorrencia,
      motivo: payload.motivo,
      detalhamento: payload.detalhamento,
      decisaoMedica: payload.decisaoMedica,
      unidadeSolicitada: payload.unidadeSolicitada,
      tipoUnidade: payload.unidadeSolicitada
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative border-l border-slate-300 shadow-2xl">
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center shrink-0">
        <div className="text-xs font-bold text-slate-700">PROTOCOLO: {data.protocolo} - DATA: {data.data} - HORA: {data.hora}</div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[300px] shrink-0 h-full overflow-hidden border-r border-slate-200">
          <TriagemSidebarInfo data={data} />
        </aside>

        <main className="flex-1 h-full overflow-hidden bg-white">
          <TriagemPanel data={data} onSave={handleSave} onBack={onClose} />
        </main>
      </div>
    </div>
  );
}
