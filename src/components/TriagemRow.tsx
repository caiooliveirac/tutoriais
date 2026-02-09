import React from 'react';
import { Ban, CheckSquare, Square } from 'lucide-react';
import { TriagemData } from '../types';

export function TriagemRow({ data, onOpenDetail, index }: { data: TriagemData; onOpenDetail?: (item: TriagemData) => void; index: number }) {
  
  const getStatusIcon = () => {
    // Priority: Locked > Check > Open
    if (data.isLocked) {
        return <Ban className="text-red-600 w-5 h-5" />;
    }

    if (data.statusIcon === 'check') {
         return <CheckSquare className="text-green-600 w-5 h-5" />;
    }
    
    return <Square className="text-green-600 w-5 h-5 opacity-60" />;
  };

  const getRiscoColor = (r: string) => {
    const map: Record<string, string> = { 
      'vermelho': 'bg-red-500', 
      'amarelo': 'bg-yellow-400', 
      'verde': 'bg-green-500', 
      'azul': 'bg-blue-500', 
      'neutro': 'bg-slate-300',
      'preto': 'bg-black',
      'hora_marcada': 'bg-sky-300'
    };
    return map[r] || 'bg-slate-300';
  };

  return (
    <div className="grid grid-cols-[110px_50px_80px_90px_1fr_1fr_1fr_1fr_1fr_2fr_1fr_50px_140px] gap-2 items-center border-b border-slate-200 bg-white hover:bg-slate-50 text-[11px] py-2 px-2 text-slate-700 font-medium">
      {/* Protocolo */}
      <div className="font-bold text-slate-900" id={`protocol-cell-${index}`}>
        <button
          onClick={() => !data.isLocked && onOpenDetail?.(data)}
          className={`text-left ${data.isLocked ? 'cursor-not-allowed text-slate-400' : 'hover:text-blue-700 cursor-pointer'}`}
          title={data.isLocked ? 'Ocorrência bloqueada' : 'Abrir ocorrência'}
        >
          {data.protocolo}
        </button>
      </div>
      
      {/* Status Icon */}
      <div className="flex justify-center">{getStatusIcon()}</div>

      {/* Data */}
      <div className="leading-tight">{data.dataHora.split(' ')[0]}</div>

      {/* Telefone */}
      <div className="leading-tight">{data.telefone}</div>

      {/* Médico */}
      <div className="truncate text-[10px]" title={data.medico}>{data.medico}</div>

      {/* Tarm */}
      <div className="truncate text-[10px]" title={data.tarm}>{data.tarm}</div>

      {/* Cidade */}
      <div className="truncate">{data.cidade}</div>

      {/* Bairro */}
      <div className="truncate font-bold text-slate-600" title={data.bairro}>{data.bairro.toUpperCase()}</div>

      {/* Solicitante */}
      <div className="truncate" title={data.solicitante}>{data.solicitante}</div>

      {/* Queixa */}
      <div id={index === 0 ? 'triagem-queixa' : undefined} className="leading-tight truncate text-slate-600" title={data.queixa}>{data.queixa.toUpperCase()}</div>

      {/* Tipo Unidade */}
      <div className="truncate text-[9px] leading-tight text-slate-500">{data.tipoUnidade || '---'}</div>

      {/* Risco */}
      <div id={index === 0 ? 'triagem-risco' : undefined} className="flex justify-center">
        <div className={`w-4 h-4 rounded-full border border-black/20 ${getRiscoColor(data.risco)}`} />
      </div>

      {/* Status da Ocorrência */}
      <div id={index === 0 ? 'triagem-status' : undefined} className="text-right">
       {data.statusBadge === 'SOLICITADO_ENVIO' ? (
          <span className="font-bold text-blue-600 block text-[9px]">SOLICITADO ENVIO<br/>{data.solicitadoHora}</span>
       ) : data.statusBadge === 'CANCELADO' ? (
          <span className="text-red-600 font-bold text-[10px]">CANCELADO (QTA)</span>
       ) : (
          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight text-center w-full border border-purple-200 shadow-sm leading-tight block">
             AGUARDANDO TRIAGEM
          </span>
       )}
      </div>
    </div>
  );
}
