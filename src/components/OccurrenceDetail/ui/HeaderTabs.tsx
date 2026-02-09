import React from 'react';
import { RegulacaoData } from '../../../../types';

interface HeaderTabsProps {
    data?: RegulacaoData;
    activeTab?: string;
    onChange?: (tab: string) => void;
}

function getUnitType(unitId?: string) {
    if (!unitId) return 'USB';
    const match = unitId.match(/\d+/);
    if (!match) return 'USB';
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 5) return 'USA';
    if (num % 10 === 0) return 'USA';
    return 'USB';
}

export function HeaderTabs({ data }: HeaderTabsProps) {
  const unitType = getUnitType(data?.equipeId);
  const unitColor = unitType === 'USA' ? 'bg-red-500' : 'bg-blue-500';

  const getRiscoColor = () => {
    const map: Record<string, string> = { 
        'vermelho': 'bg-red-500 border-red-600', 
        'amarelo': 'bg-yellow-300 border-yellow-400', 
        'verde': 'bg-green-500 border-green-600', 
        'azul': 'bg-blue-500 border-blue-600',
        'neutro': 'bg-slate-300 border-slate-400'
    };
    return map[data?.risk || data?.risco || 'amarelo'] || 'bg-yellow-300 border-yellow-400';
  };

  return (
    <div className="flex flex-col shrink-0">
        <div className={`${getRiscoColor()} w-full h-8 flex items-center justify-center border-b shrink-0`}>
            <span className="font-bold text-slate-900 text-xs tracking-wider">RISCO</span>
        </div>

        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex gap-1 shrink-0 items-end">
            <div className="bg-white border-t border-l border-r border-slate-300 rounded-t-sm px-4 py-1.5 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] relative top-[1px] z-10 cursor-pointer">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${unitColor}`}></span>
                    {data?.equipeId || '?? 00'} 
                    <span className="text-[10px] bg-slate-100 px-1 rounded ml-1 border border-slate-200 text-slate-500">{unitType}</span>
                </span>
            </div>
            
            {(data?.statusType === 'REGULADO' || data?.statusType === 'PROCURANDO_RECURSO' || data?.statusText?.includes('Regulado')) && (
                <div className="bg-slate-200 hover:bg-white border-t border-l border-r border-slate-300 rounded-t-sm px-4 py-1.5 relative top-[1px] z-0 text-slate-500 cursor-pointer">
                    <span className="font-bold text-xs">
                        Vítima 1
                    </span>
                </div>
            )}
        </div>
    </div>
  );
}
