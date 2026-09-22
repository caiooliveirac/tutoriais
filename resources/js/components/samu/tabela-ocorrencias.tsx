import type { ReactNode } from 'react';

export type Coluna = { titulo: string; className?: string };

/**
 * Tabela no estilo SAMU MAIS: título em caixa alta com filete laranja,
 * cabeçalho em grid com colunas fixas.
 */
export function TabelaOcorrencias({
    titulo,
    colunas,
    grid,
    children,
}: {
    titulo: string;
    colunas: Coluna[];
    grid: string;
    children?: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded border border-neutral-200 bg-white shadow-sm">
            <div className="px-4 pt-3">
                <h2 className="mb-1 text-xs font-bold tracking-wider text-black uppercase">
                    {titulo}
                </h2>
                <div className="mb-2 h-[2px] w-full bg-orange-500" />
            </div>

            <div
                className={`grid ${grid} items-end gap-2 border-b border-neutral-300 px-2 py-2 text-[10px] font-bold tracking-tight text-neutral-700 uppercase`}
            >
                {colunas.map((coluna) => (
                    <div key={coluna.titulo} className={coluna.className}>
                        {coluna.titulo}
                    </div>
                ))}
            </div>

            <div className="divide-y divide-neutral-100">
                {children ?? (
                    <p className="px-4 py-6 text-center text-xs text-neutral-500">
                        Nenhuma ocorrência.
                    </p>
                )}
            </div>
        </section>
    );
}
