import React, { useState } from 'react';
import { Ban, CheckSquare, Square, XCircle } from 'lucide-react';
import { RegulacaoData } from '../types';
import { StatusBadge } from './StatusBadge';
import { EventModal } from './EventModal';

export function RegulacaoRow({ data, onClearEvent, onOpenDetail }: { 
    data: RegulacaoData; 
    onClearEvent: (id: string) => void;
    onOpenDetail?: (data: RegulacaoData) => void; 
}) {
  const [showEventModal, setShowEventModal] = useState(false);

  const handleCloseModal = () => {
      setShowEventModal(false);
      onClearEvent(data.id);
  };

  const getStatusIcon = () => {
     if (data.statusType === 'PROCURANDO_RECURSO' || data.statusType === 'REGULADO') {
         return <CheckSquare className="text-green-600 w-5 h-5" />;
     }
     return <Square className="text-green-600 w-5 h-5 opacity-60" />;
  };
  
  const getRiscoColor = (r: string) => {
    const map: any = { 
      'vermelho': 'bg-red-500', 
      'amarelo': 'bg-yellow-400', 
      'verde': 'bg-green-500', 
      'azul': 'bg-blue-500' 
    };
    return map[r] || 'bg-slate-300';
  };

  return (
    <>
    <div className="grid grid-cols-[100px_40px_80px_1fr_1fr_1fr_2fr_170px_50px_160px] gap-2 items-center border-b border-slate-200 bg-white hover:bg-slate-50 text-[11px] py-4 px-2 text-slate-700 font-medium min-h-[50px]">
       {/* Protocolo - Clickable to Open Detail */}
       <div 
         id={`regulacao-protocol-${data.id}`}
         className="font-bold text-slate-900 cursor-pointer hover:font-black transition-all"
         onClick={() => onOpenDetail?.(data)}
         title="Clique para abrir detalhes da ocorrência"
       >
           {data.protocolo}
       </div>

       <div className="flex justify-center">
           {getStatusIcon()}
       </div>

       {/* Data */}
       <div>{data.hora}</div>

       {/* Cidade */}
       <div className="truncate">{data.cidade}</div>

       {/* Bairro */}
       <div className="truncate font-bold text-slate-600" title={data.bairro}>{data.bairro.toUpperCase()}</div>

       {/* Medico */}
       <div className="truncate text-[10px]" title={data.medico}>{data.medico}</div>

       {/* Queixa */}
       <div className="leading-tight truncate text-slate-600" title={data.queixa}>{data.queixa.toUpperCase()}</div>

       {/* Equipe or QTA Signal */}
       <div className="text-right pr-6 font-mono font-bold text-slate-900 h-full flex flex-col justify-center items-end relative">
          
          {/* Active Event Asterisk - Always visible if event exists */}
          {data.activeEvent && (
                <div 
                    onClick={() => setShowEventModal(true)}
                    className="text-red-600 text-6xl leading-[0.5] font-black cursor-pointer hover:scale-110 transition-transform animate-pulse select-none mb-2 hover:text-red-700 relative z-20"
                    title="Clique para ver Detalhes do Evento"
                >
                    *
                </div>
          )}

          {data.isQTA || data.isUnitReleased ? (
              <div 
                  className="py-1 cursor-default grayscale-[0.2]"
                  title={data.isUnitReleased ? "Unidade Liberada Sem Alocação" : "Unidade Desvinculada / Sem Contato"}
              >
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-md border-2 border-red-100">
                    <XCircle className="text-white w-6 h-6" />
                </div>
              </div>
          ) : (
            <div className="flex flex-col items-end group">
                <div className="leading-none">{data.equipeId}</div>
                <span className="text-slate-400 text-[9px] block font-normal mt-0.5">{data.equipeTime}</span>
            </div>
          )}
       </div>

       {/* Risco */}
       <div className="flex justify-center">
            <div className={`w-4 h-4 rounded-full border border-black/20 ${getRiscoColor(data.risco)}`} />
       </div>

       {/* Status Badge */}
       <div className="text-right pr-2">
           <StatusBadge type={data.statusType} label={data.statusText || data.statusType} />
       </div>
    </div>

    {/* Event Modal attached to this row */}
    <EventModal 
        isOpen={showEventModal} 
        onClose={handleCloseModal} 
        event={data.activeEvent}
    />
    </>
  );
}
