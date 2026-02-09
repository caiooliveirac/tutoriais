import React from 'react';

interface StatusBadgeProps {
  type: 'AGUARDANDO_RETORNO' | 'PROCURANDO_RECURSO' | 'REGULADO' | 'CUSTOM';
  label?: string;
  color?: 'yellow' | 'blue' | 'cyan' | 'purple' | 'red';
}

export function StatusBadge({ type, label, color }: StatusBadgeProps) {
  if (type === 'AGUARDANDO_RETORNO') {
    return (
      <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight text-center w-full border border-yellow-500 shadow-sm leading-tight block">
        Aguardando Retorno da Equipe
      </span>
    );
  }

  if (type === 'PROCURANDO_RECURSO') {
    return (
      <span className="bg-blue-700 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight text-center w-full border border-blue-900 shadow-sm leading-tight block">
        Procurando Recurso
      </span>
    );
  }

  if (type === 'REGULADO') {
    return (
      <span className="bg-cyan-200 text-cyan-900 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-tight text-center w-full border border-cyan-300 shadow-sm leading-tight block">
        {label || 'Regulado para Hospital'}
      </span>
    );
  }

  // Fallback / Custom
  const colorClass = {
    yellow: "bg-yellow-400 text-yellow-900 border-yellow-500",
    blue: "bg-blue-700 text-white border-blue-900",
    cyan: "bg-cyan-200 text-cyan-900 border-cyan-300",
    purple: "bg-purple-600 text-white border-purple-800",
    red: "bg-red-600 text-white border-red-800",
  }[color || 'yellow'];

  return (
    <span className={`${colorClass} px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight text-center w-full border shadow-sm leading-tight block`}>
       {label}
    </span>
  );
}
