import { useEffect, useState } from 'react';
import { buscarJson } from '@/lib/buscar-json';
import { bairros } from '@/routes/atendimento';
import type { BairroSugerido } from '@/types';
import { campo } from './estilos';

type Props = {
    valor: string;
    erro?: string;
    onMudar: (bairro: string) => void;
    // bairro reconhecido: o mapa vai até ele e as buscas passam a preferir a região
    onReconhecer: (b: BairroSugerido | null) => void;
};

const normalizar = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

/**
 * Primeiro campo do local. Aceita o bairro escrito de ouvido e oferece
 * "Quis dizer: Tororó?" (casamento por som com os bairros de Salvador).
 */
export function CampoBairro({ valor, erro, onMudar, onReconhecer }: Props) {
    const [parecidos, setParecidos] = useState<BairroSugerido[]>([]);

    useEffect(() => {
        const texto = valor.trim();

        if (texto.length < 3) {
            setParecidos([]);
            onReconhecer(null);

            return;
        }

        const espera = setTimeout(() => {
            buscarJson<BairroSugerido[]>(bairros.url({ query: { q: texto } }))
                .then((r) => {
                    const igual = r.find(
                        (b) => normalizar(b.nome) === normalizar(texto),
                    );
                    onReconhecer(igual ?? null);
                    setParecidos(igual ? [] : r);
                })
                .catch(() => setParecidos([]));
        }, 400);

        return () => clearTimeout(espera);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valor]);

    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-black">
                1. Bairro{' '}
                <span className="font-normal text-neutral-600">
                    — pergunte primeiro; filtra referências e ruas
                </span>
            </span>
            <input
                className={campo}
                value={valor}
                onChange={(e) => onMudar(e.target.value)}
                placeholder="Como o solicitante falar"
            />
            {parecidos.length > 0 && (
                <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-neutral-700">
                    Quis dizer:
                    {parecidos.map((p) => (
                        <button
                            key={p.nome}
                            type="button"
                            onClick={() => onMudar(p.nome)}
                            className="rounded bg-yellow-300 px-1.5 font-bold text-black hover:bg-yellow-400"
                        >
                            {p.nome}
                        </button>
                    ))}
                </span>
            )}
            {erro && (
                <span className="mt-0.5 block text-[10px] text-red-600">
                    {erro}
                </span>
            )}
        </label>
    );
}
