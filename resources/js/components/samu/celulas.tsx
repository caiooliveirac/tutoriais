import { Lock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Linha } from '@/types';

const coresRisco: Record<string, string> = {
    vermelho: 'bg-red-600',
    amarelo: 'bg-yellow-400',
    verde: 'bg-green-500',
    azul: 'bg-blue-500',
    preto: 'bg-black',
    hora_marcada: 'bg-white ring-2 ring-neutral-400',
};

/** Bolinha da classificação de risco (cores clínicas, não da marca). */
export function RiscoBolinha({ risco }: { risco: string | null }) {
    return (
        <div className="flex justify-center">
            <span
                title={risco ?? 'Sem classificação'}
                className={cn(
                    'size-4 rounded-full border border-black/10',
                    risco ? coresRisco[risco] : 'bg-neutral-200',
                )}
            />
        </div>
    );
}

export function Protocolo({ linha }: { linha: Linha }) {
    if (linha.travada_por) {
        return (
            <div
                className="flex items-center gap-1 font-bold text-neutral-400"
                title={`Ficha aberta por ${linha.travada_por}`}
            >
                <Lock size={12} />
                {linha.protocolo}
            </div>
        );
    }

    return <div className="font-bold text-black">{linha.protocolo}</div>;
}

const badge =
    'block w-full rounded-md border px-2 py-0.5 text-center text-[9px] leading-tight font-bold tracking-tight uppercase shadow-sm';

export function StatusOcorrencia({ linha }: { linha: Linha }) {
    switch (linha.status) {
        case 'aguardando_triagem':
            return (
                <span className="text-[10px] font-bold text-black">
                    AGUARDANDO TRIAGEM
                </span>
            );
        case 'solicitado_envio':
            return (
                <span className="block text-[10px] leading-tight font-bold text-orange-600">
                    SOLICITADO ENVIO
                    <br />
                    {linha.tipo_recurso} • {linha.solicitado_envio_hora}
                </span>
            );
        case 'aguardando_retorno':
            return (
                <span
                    className={cn(
                        badge,
                        'border-yellow-500 bg-yellow-400 text-black',
                    )}
                >
                    Aguardando retorno da equipe
                </span>
            );
        case 'procurando_recurso':
            return (
                <span
                    className={cn(
                        badge,
                        'border-orange-700 bg-orange-500 text-white',
                    )}
                >
                    Procurando recurso
                </span>
            );
        case 'regulado':
            return (
                <span className={cn(badge, 'border-black bg-white text-black')}>
                    Regulado para {linha.hospital}
                </span>
            );
        case 'cancelado':
            return (
                <span className="text-[10px] font-bold text-red-600 uppercase">
                    Cancelado
                    <br />
                    <span className="font-normal">{linha.decisao_medica}</span>
                </span>
            );
        case 'encerrado_sem_envio':
            return (
                <span className="text-[9px] leading-tight text-neutral-700 uppercase">
                    {linha.decisao_medica}
                </span>
            );
        default:
            return (
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    {linha.status_label}
                </span>
            );
    }
}

/** Unidade empenhada, com os sinais de intercorrência do mock. */
export function Equipe({ linha }: { linha: Linha }) {
    return (
        <div className="flex items-center justify-end gap-2 pr-4">
            {linha.intercorrencia && (
                <span
                    title={linha.intercorrencia}
                    className="animate-pulse cursor-help text-3xl leading-none font-black text-red-600 select-none"
                >
                    *
                </span>
            )}
            {linha.unidade_desvinculada ? (
                <span
                    title={`Unidade ${linha.unidade} desvinculada`}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-red-100 bg-red-600 shadow"
                >
                    <XCircle className="size-5 text-white" />
                </span>
            ) : (
                <span className="text-right font-mono leading-tight font-bold text-black">
                    {linha.unidade}
                    <br />
                    <span className="text-[9px] font-normal text-neutral-500">
                        {linha.despachada_hora}
                    </span>
                </span>
            )}
        </div>
    );
}
