import { Head } from '@inertiajs/react';
import type { Coluna } from '@/components/samu/tabela-ocorrencias';
import { TabelaOcorrencias } from '@/components/samu/tabela-ocorrencias';

type Tabela = { titulo: string; colunas: Coluna[]; grid: string };

const triagem: Tabela = {
    titulo: 'Triagem',
    grid: 'grid-cols-[110px_50px_80px_90px_1fr_1fr_1fr_1fr_1fr_2fr_1fr_50px_140px]',
    colunas: [
        { titulo: 'Protocolo' },
        { titulo: 'Status', className: 'text-center' },
        { titulo: 'Data' },
        { titulo: 'Telefone' },
        { titulo: 'Médico' },
        { titulo: 'TARM' },
        { titulo: 'Cidade' },
        { titulo: 'Bairro' },
        { titulo: 'Solicitante' },
        { titulo: 'Queixa' },
        { titulo: 'Tipo unidade' },
        { titulo: 'Risco', className: 'text-center' },
        { titulo: 'Status da ocorrência', className: 'text-right' },
    ],
};

const regulacao: Tabela = {
    titulo: 'Regulação',
    grid: 'grid-cols-[100px_40px_80px_1fr_1fr_1fr_2fr_170px_50px_160px]',
    colunas: [
        { titulo: 'Protocolo' },
        { titulo: 'Status', className: 'text-center' },
        { titulo: 'Data' },
        { titulo: 'Cidade' },
        { titulo: 'Bairro' },
        { titulo: 'Médico' },
        { titulo: 'Queixa' },
        { titulo: 'Equipe', className: 'text-right pr-6' },
        { titulo: 'Risco', className: 'text-center' },
        { titulo: 'Status da ocorrência', className: 'text-right pr-2' },
    ],
};

const despacho: Tabela = {
    titulo: 'Aguardando despacho',
    grid: 'grid-cols-[110px_80px_1fr_1fr_2fr_50px_140px_160px]',
    colunas: [
        { titulo: 'Protocolo' },
        { titulo: 'Data' },
        { titulo: 'Cidade' },
        { titulo: 'Bairro' },
        { titulo: 'Queixa' },
        { titulo: 'Risco', className: 'text-center' },
        { titulo: 'Médico' },
        { titulo: 'Recurso (USA/USB/Moto)', className: 'text-right' },
    ],
};

const chamados: Tabela = {
    titulo: 'Meus chamados',
    grid: 'grid-cols-[110px_80px_90px_1fr_1fr_1fr_2fr_140px]',
    colunas: [
        { titulo: 'Protocolo' },
        { titulo: 'Data' },
        { titulo: 'Telefone' },
        { titulo: 'Solicitante' },
        { titulo: 'Cidade' },
        { titulo: 'Bairro' },
        { titulo: 'Queixa' },
        { titulo: 'Status', className: 'text-right' },
    ],
};

const tabelasPorArea: Record<string, Tabela[]> = {
    atendimento: [chamados],
    triagem: [triagem, regulacao],
    despacho: [despacho, regulacao],
    plantao: [triagem, despacho, regulacao],
    bi: [],
};

export default function Area({
    slug,
    titulo,
}: {
    slug: string;
    titulo: string;
}) {
    const tabelas = tabelasPorArea[slug] ?? [];

    return (
        <>
            <Head title={titulo} />
            {tabelas.map((tabela) => (
                <TabelaOcorrencias key={tabela.titulo} {...tabela} />
            ))}
            {tabelas.length === 0 && (
                <p className="py-10 text-center text-sm text-neutral-500">
                    {titulo}: em construção.
                </p>
            )}
        </>
    );
}
