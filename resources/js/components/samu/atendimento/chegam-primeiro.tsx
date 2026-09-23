import type { Estimativa } from '@/types';

/** Ranking das unidades livres que chegam primeiro ao local marcado. */
export function ChegamPrimeiro({
    estimativa,
}: {
    estimativa: Estimativa | null;
}) {
    return (
        <section className="rounded border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="flex items-baseline justify-between">
                <h2 className="text-xs font-bold tracking-wider text-black uppercase">
                    Chegam primeiro
                </h2>
                {estimativa && (
                    <span className="text-[10px] text-neutral-600">
                        {estimativa.fonte === 'osrm'
                            ? 'tempo por rua (OSRM, sem trânsito)'
                            : 'ESTIMATIVA EM LINHA RETA — roteador indisponível'}
                    </span>
                )}
            </div>
            <div className="mt-1 mb-2 h-[2px] bg-orange-500" />
            {!estimativa ? (
                <p className="py-3 text-center text-xs text-neutral-500">
                    Marque o local para ver as unidades mais próximas.
                </p>
            ) : (
                <ol className="grid gap-1 text-[11px] md:grid-cols-2">
                    {estimativa.unidades.slice(0, 8).map((u, i) => (
                        <li
                            key={u.codigo}
                            className="flex items-center justify-between rounded border border-neutral-200 px-2 py-1"
                        >
                            <span>
                                <b className="font-mono">
                                    {i + 1}. {u.codigo}
                                </b>{' '}
                                <span className="text-neutral-600">
                                    {u.tipo} ·{' '}
                                    {u.origem === 'posicao'
                                        ? 'em movimento'
                                        : u.base}
                                </span>
                            </span>
                            <span className="font-bold">
                                {u.minutos} min{' '}
                                <span className="font-normal text-neutral-500">
                                    {u.km} km
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
