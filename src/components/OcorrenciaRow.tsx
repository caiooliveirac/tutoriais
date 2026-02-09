import React from 'react';
import { 
  Megaphone, 
  Ambulance, 
  Ban, 
  CheckCircle2, 
  Square, 
  Phone, 
  MapPin, 
  Clock 
} from 'lucide-react';

export interface Ocorrencia {
  id: string;
  protocolo: string;
  dataHora: string;
  telefone: string;
  medico: string;
  tarm: string;
  cidade: string;
  bairro: string;
  solicitante: string;
  queixa: string;
  tipoUnidade: string;
  risco: 'vermelho' | 'amarelo' | 'verde' | 'azul';
  status: 'PENDENTE' | 'AGUARDANDO_TRIAGEM' | 'AGUARDANDO_RETORNO' | 'FINALIZADO' | 'CANCELADO';
  tempo: string;
  equipe?: string;
}

interface OcorrenciaRowProps {
  data: Ocorrencia;
  onClick: () => void;
}

export function OcorrenciaRow({ data, onClick }: OcorrenciaRowProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_TRIAGEM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-800 border border-purple-300 uppercase leading-tight">Aguardando Triagem</span>;
      case 'AGUARDANDO_RETORNO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-200 text-yellow-800 border border-yellow-300 uppercase leading-tight">Aguardando Retorno Eq.</span>;
      case 'CANCELADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase leading-tight">Cancelado</span>;
      case 'FINALIZADO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200 uppercase leading-tight">Finalizado</span>;
      default: // PENDENTE
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 uppercase leading-tight">Pendente</span>;
    }
  };

  const getRiscoDot = (risco: string) => {
    const colors = {
      vermelho: 'bg-red-500',
      amarelo: 'bg-yellow-400',
      verde: 'bg-green-500',
      azul: 'bg-blue-500'
    };
    return <div className={`w-3 h-3 rounded-full ${colors[risco as keyof typeof colors]} shadow-sm border border-white mx-auto`} />;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'CANCELADO') return <Ban size={14} className="text-red-500" />;
    if (status === 'FINALIZADO') return <CheckCircle2 size={14} className="text-green-500" />;
    if (status === 'AGUARDANDO_TRIAGEM' || status === 'PENDENTE') return <Square size={14} className="text-orange-400 fill-orange-100" />;
    return <Megaphone size={14} className="text-blue-500" />;
  };

  return (
    <div 
      onClick={onClick}
      className={`grid grid-cols-12 gap-1 items-center border-b border-slate-200 hover:bg-orange-50/50 cursor-pointer transition-colors text-[11px] py-1.5 px-2 ${data.status === 'CANCELADO' ? 'opacity-60 bg-slate-50' : 'bg-white'}`}
    >
      {/* 1. Protocolo e Status */}
      <div className="col-span-2 flex items-center gap-2">
         {getStatusIcon(data.status)}
         <span className="bg-slate-900 text-white rounded px-1.5 py-0.5 font-mono text-[10px] tracking-tight">{data.protocolo}</span>
      </div>

      {/* 2. Data/Hora */}
      <div className="col-span-1 flex flex-col leading-tight text-slate-500">
         <span>{data.dataHora.split(' ')[0]}</span>
         <span className="font-bold text-slate-700">{data.dataHora.split(' ')[1]}</span>
      </div>

       {/* 3. TARM/Médico */}
      <div className="col-span-2 flex flex-col leading-tight">
          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-bold text-slate-800">TARM:</span> {data.tarm}
          </div>
          <div className="flex items-center gap-1 text-blue-700">
            <span className="font-bold">MED:</span> {data.medico}
          </div>
      </div>

      {/* 4. Paciente/Queixa (Mais largo) */}
      <div className="col-span-3 flex flex-col">
          <div className="font-bold text-slate-800 truncate uppercase">{data.solicitante}</div>
          <div className="text-slate-600 truncate italic flex items-center gap-1">
             <span className="font-semibold text-red-600">QX:</span> {data.queixa}
          </div>
      </div>

      {/* 5. Local */}
      <div className="col-span-2 flex flex-col text-slate-600 leading-tight">
          <span className="font-bold uppercase truncate">{data.cidade}</span>
          <span className="truncate text-[10px] text-slate-500 uppercase">{data.bairro}</span>
      </div>

      {/* 6. Status/Risco */}
      <div className="col-span-2 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
             {getStatusBadge(data.status)}
             {getRiscoDot(data.risco)}
          </div>
          {/* Equipe alocada se houver */}
          {data.equipe && (
              <div className="flex items-center gap-1 bg-yellow-50 px-1 rounded border border-yellow-200 text-yellow-800 mt-0.5">
                  <Ambulance size={10} />
                  <span className="font-bold">{data.equipe}</span>
                  <Megaphone size={10} className="ml-1" />
              </div>
          )}
      </div>
    </div>
  );
}
