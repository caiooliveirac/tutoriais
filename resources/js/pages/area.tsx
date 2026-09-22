import { Head } from '@inertiajs/react';
import {
    Equipe,
    Protocolo,
    RiscoBolinha,
    StatusOcorrencia,
} from '@/components/samu/celulas';
import type { Coluna } from '@/components/samu/tabela-ocorrencias';
import { TabelaOcorrencias } from '@/components/samu/tabela-ocorrencias';
import type { Linha } from '@/types';

type Tabela = { titulo: string; colunas: Coluna[]; grid: string };

const c = {
    protocolo: {
        titulo: 'Protocolo',
        celula: (l: Linha) => <Protocolo linha={l} />,
    },
    hora: { titulo: 'Hora', celula: (l: Linha) => l.hora },
    telefone: { titulo: 'Telefone', celula: (l: Linha) => l.telefone },
    medico: { titulo: 'Médico', celula: (l: Linha) => l.medico ?? '---' },
    tarm: { titulo: 'TARM', celula: (l: Linha) => l.tarm },
    cidade: { titulo: 'Cidade', celula: (l: Linha) => l.cidade },
    bairro: { titulo: 'Bairro', celula: (l: Linha) => l.bairro },
    solicitante: { titulo: 'Solicitante', celula: (l: Linha) => l.solicitante },
    queixa: { titulo: 'Queixa', celula: (l: Linha) => l.queixa },
    recurso: {
        titulo: 'Tipo unidade',
        celula: (l: Linha) => l.tipo_recurso ?? '',
    },
    risco: {
        titulo: 'Risco',
        className: 'text-center',
        celula: (l: Linha) => <RiscoBolinha risco={l.risco} />,
    },
    status: {
        titulo: 'Status da ocorrência',
        className: 'text-right whitespace-normal',
        celula: (l: Linha) => <StatusOcorrencia linha={l} />,
    },
    equipe: {
        titulo: 'Equipe',
        className: 'overflow-visible',
        celula: (l: Linha) => <Equipe linha={l} />,
    },
} satisfies Record<string, Coluna>;

const tabelas: Record<string, Tabela> = {
    chamados: {
        titulo: 'Meus chamados',
        grid: 'grid-cols-[120px_70px_110px_1fr_1fr_2fr_50px_170px]',
        colunas: [
            c.protocolo,
            c.hora,
            c.telefone,
            c.solicitante,
            c.bairro,
            c.queixa,
            c.risco,
            c.status,
        ],
    },
    triagem: {
        titulo: 'Triagem',
        grid: 'grid-cols-[120px_70px_110px_1fr_1fr_1fr_1fr_2fr_50px_170px]',
        colunas: [
            c.protocolo,
            c.hora,
            c.telefone,
            c.medico,
            c.tarm,
            c.bairro,
            c.solicitante,
            c.queixa,
            c.risco,
            c.status,
        ],
    },
    despacho: {
        titulo: 'Aguardando despacho',
        grid: 'grid-cols-[120px_70px_1fr_1fr_2fr_90px_50px_170px]',
        colunas: [
            c.protocolo,
            c.hora,
            c.bairro,
            c.medico,
            c.queixa,
            c.recurso,
            c.risco,
            c.status,
        ],
    },
    regulacao: {
        titulo: 'Regulação',
        grid: 'grid-cols-[120px_70px_1fr_1fr_2fr_130px_50px_180px]',
        colunas: [
            c.protocolo,
            c.hora,
            c.bairro,
            c.medico,
            c.queixa,
            c.equipe,
            c.risco,
            c.status,
        ],
    },
    encerradas: {
        titulo: 'Encerradas (12h)',
        grid: 'grid-cols-[120px_70px_1fr_1fr_2fr_50px_220px]',
        colunas: [
            c.protocolo,
            c.hora,
            c.bairro,
            c.medico,
            c.queixa,
            c.risco,
            c.status,
        ],
    },
};

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
