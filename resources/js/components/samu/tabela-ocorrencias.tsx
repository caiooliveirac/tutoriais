import type { ReactNode } from 'react';
import type { Linha } from '@/types';

export type Coluna = {
    titulo: string;
    className?: string;
    celula: (linha: Linha) => ReactNode;
};

/**
 * Tabela no estilo SAMU MAIS: título em caixa alta com filete laranja,
 * cabeçalho e linhas no mesmo grid de colunas fixas.
 */
export function TabelaOcorrencias({
    titulo,
    colunas,
    grid,
    linhas,
}: {
    titulo: string;
    colunas: Coluna[];
    grid: string;
    linhas: Linha[];
}) {
    return (
        <section className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-baseline justify-between px-4 pt-3">
                <h2 className="mb-1 text-xs font-bold tracking-wider text-black uppercase">
                    {titulo}
                </h2>
                <span className="text-[10px] font-bold text-neutral-500">
                    {linhas.length}
                </span>
            </div>
            <div className="mx-4 mb-2 h-[2px] bg-orange-500" />

            <div
                className={`grid ${grid} items-end gap-2 border-b border-neutral-300 px-2 py-2 text-[10px] font-bold tracking-tight text-neutral-700 uppercase`}
            >
                {colunas.map((coluna) => (
                    <div key={coluna.titulo} className={coluna.className}>
                        {coluna.titulo}
                    </div>
                ))}
            </div>

            {linhas.map((linha) => (
                <div
                    key={linha.id}
                    className={`grid ${grid} min-h-[46px] items-center gap-2 border-b border-neutral-100 px-2 py-2 text-[11px] font-medium text-black hover:bg-orange-50`}
                >
                    {colunas.map((coluna) => (
                        <div
                            key={coluna.titulo}
                            className={`min-w-0 truncate ${coluna.className ?? ''}`}
                            title={
                                typeof coluna.celula(linha) === 'string'
                                    ? (coluna.celula(linha) as string)
                                    : undefined
                            }
                        >
                            {coluna.celula(linha)}
                        </div>
                    ))}
                </div>
            ))}

            {linhas.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-neutral-500">
                    Nenhuma ocorrência.
                </p>
            )}
        </section>
    );
}
