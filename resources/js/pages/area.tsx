import { Head } from '@inertiajs/react';
import { TabelaOcorrencias } from '@/components/samu/tabela-ocorrencias';
import { tabelas } from '@/components/samu/tabelas';
import type { Linha } from '@/types';

export default function Area({
    titulo,
    tabelas: dados,
}: {
    titulo: string;
    tabelas: Record<string, Linha[]>;
}) {
    const chaves = Object.keys(dados);

    return (
        <>
            <Head title={titulo} />
            {chaves.map((chave) => (
                <TabelaOcorrencias
                    key={chave}
                    {...tabelas[chave]}
                    linhas={dados[chave]}
                />
            ))}
            {chaves.length === 0 && (
                <p className="py-10 text-center text-sm text-neutral-500">
                    {titulo}: em construção.
                </p>
            )}
        </>
    );
}
