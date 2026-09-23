import { useEffect, useRef, useState } from 'react';
import { buscarJson } from '@/lib/buscar-json';
import { lugar, sugerir } from '@/routes/atendimento';
import type { Lugar, Sugestao } from '@/types';
import { campo } from './estilos';

type Props = {
    valor: string;
    erro?: string;
    provedor: 'google' | 'osm';
    onDigitar: (texto: string) => void;
    onEscolher: (l: Lugar) => void;
};

function novaSessao(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now());
}

/**
 * Endereço com autocompletar. No Google, a busca tolera erro de digitação
 * ("rua do tororo 18", "av sete de setenbro") e a sessão agrupa as buscas
 * de um mesmo chamado numa cobrança só.
 */
export function CampoEndereco({
    valor,
    erro,
    provedor,
    onDigitar,
    onEscolher,
}: Props) {
    const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
    const [aviso, setAviso] = useState<string | null>(null);
    const [aberto, setAberto] = useState(false);
    const sessao = useRef(novaSessao());
    const escolhido = useRef<string | null>(null);

    useEffect(() => {
        const texto = valor.trim();

        if (texto.length < 4 || texto === escolhido.current) {
            setSugestoes([]);

            return;
        }

        const espera = setTimeout(
            () => {
                buscarJson<Sugestao[]>(
                    sugerir.url({
                        query: { q: texto, sessao: sessao.current },
                    }),
                )
                    .then((r) => {
                        setSugestoes(r);
                        setAberto(true);
                        setAviso(
                            r.length === 0
                                ? 'Nada encontrado. Tente só o nome da rua, ou localize pelo ponto de referência.'
                                : null,
                        );
                    })
                    .catch((e: Error) => setAviso(e.message));
            },
            provedor === 'google' ? 350 : 700,
        );

        return () => clearTimeout(espera);
    }, [valor, provedor]);

    async function escolher(s: Sugestao) {
        setAberto(false);

        try {
            const l: Lugar =
                s.lat !== undefined && s.lng !== undefined
                    ? {
                          rotulo: `${s.principal}, ${s.secundario}`,
                          logradouro: s.logradouro ?? s.principal,
                          numero: s.numero ?? null,
                          bairro: s.bairro ?? null,
                          lat: s.lat,
                          lng: s.lng,
                      }
                    : await buscarJson<Lugar>(
                          lugar.url({
                              query: { id: s.id, sessao: sessao.current },
                          }),
                      );

            escolhido.current =
                [l.logradouro, l.numero].filter(Boolean).join(', ') || l.rotulo;
            sessao.current = novaSessao();
            onEscolher(l);
        } catch (e) {
            setAviso((e as Error).message);
        }
    }

    return (
        <div className="relative">
            <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-black">
                    Endereço
                </span>
                <input
                    className={campo}
                    value={valor}
                    onChange={(e) => onDigitar(e.target.value)}
                    onFocus={() => setAberto(sugestoes.length > 0)}
                    placeholder="Rua, número — pode digitar do jeito que ouvir"
                    autoComplete="off"
                />
            </label>
            {erro && (
                <span className="mt-0.5 block text-[10px] text-red-600">
                    {erro}
                </span>
            )}
            {aberto && sugestoes.length > 0 && (
                <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded border border-neutral-300 bg-white shadow-lg">
                    {sugestoes.map((s) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                onClick={() => void escolher(s)}
                                className="block w-full px-2 py-1.5 text-left text-xs hover:bg-orange-50"
                            >
                                <b>{s.principal}</b>{' '}
                                <span className="text-neutral-600">
                                    {s.secundario}
                                </span>
                            </button>
                        </li>
                    ))}
                    {provedor === 'google' && (
                        <li className="px-2 py-0.5 text-right text-[9px] text-neutral-500">
                            powered by Google
                        </li>
                    )}
                </ul>
            )}
            {aviso && (
                <p className="mt-0.5 text-[10px] text-orange-700">{aviso}</p>
            )}
        </div>
    );
}
