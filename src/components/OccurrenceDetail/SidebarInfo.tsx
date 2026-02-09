import React from 'react';
import { RegulacaoData } from '../../types';

export function SidebarInfo({ data }: { data?: RegulacaoData }) {
  if (!data) return <div className="p-4 bg-white border-r border-orange-200 h-full">Carregando dados...</div>;

  return (
    <div className="bg-white border-r border-orange-200 h-full flex flex-col text-xs font-sans">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* SECTION 1 */}
          <div>
            <h2 className="font-bold text-orange-500 border-b-2 border-orange-300 pb-0.5 mb-2 uppercase text-[11px]">
                Informações da Triagem
            </h2>
            <div className="mb-2" id="regulacao-hma-data">
                <span className="font-bold text-slate-700 block mb-1">HMA/Complemento HMA:</span>
                <p className="text-slate-600 leading-tight uppercase">
                    {data.hma || 'SEM INFORMAÇÕES COMPLEMENTARES REGISTRADAS PELO TARM.'}
                </p>
            </div>
          </div>

          {/* SECTION 2 */}
          <div>
            <h2 className="font-bold text-orange-500 border-b-2 border-orange-300 pb-0.5 mb-2 uppercase text-[11px]">
                Informações do TARM
            </h2>
            
            <div className="space-y-1 text-slate-800 uppercase">
                <div className="flex gap-1"><span className="font-bold text-slate-900">VÍTIMA:</span> {data.paciente || 'NÃO INFORMADO'}</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">Idade:</span> {data.idade || '--'}</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">REGULAÇÃO SECUNDÁRIA:</span> NÃO</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">SOLICITANTE:</span> {data.solicitante || 'DESCONHECIDO'}</div>
                
                <div className="flex gap-1 mt-2"><span className="font-bold text-slate-900">TEL. INFORMADO:</span> {data.telefone || '--'}</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">TEL. IDENTIFICADO:</span> {data.telefone || '--'}</div>
                
                <div className="flex gap-1 mt-2"><span className="font-bold text-slate-900">SEXO:</span> {data.sexo || '--'}</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">CIDADE:</span> {data.cidade}</div>
                <div className="flex gap-1"><span className="font-bold text-slate-900">BAIRRO:</span> {data.bairro}</div>
                
                <div className="flex gap-1 mt-2 line-clamp-2"><span className="font-bold text-slate-900">ENDEREÇO:</span> {data.endereco || 'ENDEREÇO NÃO REGISTRADO'}</div>
                <div className="flex gap-1 line-clamp-2"><span className="font-bold text-slate-900">REFERÊNCIA:</span> {data.pontoReferencia || '--'}</div>
                
                <div className="flex gap-1 mt-2"><span className="font-bold text-slate-900">QUEIXA:</span> {data.queixa}</div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div>
             <h2 className="font-bold text-orange-500 border-b-2 border-orange-300 pb-0.5 mb-2 uppercase text-[11px]">
                Médicos Ativos na Ocorrência
            </h2>
            <div className="text-slate-800 font-medium uppercase">- {data.medico}</div>
          </div>

      </div>

      {/* FOOTER BUTTONS */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2 shrink-0">
          <button className="w-full bg-[#7bc143] hover:bg-[#68a638] text-white font-bold py-2 px-4 rounded text-xs uppercase shadow-sm border-b-2 border-[#5a9130]">
              Transferir Ocorrência
          </button>
          <button className="w-full bg-[#5d4b8e] hover:bg-[#4d3d78] text-white font-bold py-2 px-4 rounded text-xs uppercase shadow-sm border-b-2 border-[#3f3163]">
              Compartilhar Ocorrência
          </button>
      </div>

    </div>
  );
}
