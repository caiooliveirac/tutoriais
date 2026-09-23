import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { buscarJson } from '@/lib/buscar-json';
import { referencia } from '@/routes/atendimento';
import type { Arredores, LugarEncontrado, Rua } from '@/types';
import { botaoSecundario, campo } from './estilos';
import { Homonimo } from './homonimo';

type Props = {
    bairro: string;
    textoReferencia: string;
    onTextoReferencia: (t: string) => void;
    ponto: [number, number] | null;
    onUsarLugar: (
        lat: number,
        lng: number,
        bairro: string | null,
        nome: string,
        origem: string,
    ) => void;
    erro?: string;
};

/**
 * 2. Ponto de referência: o solicitante leigo quase sempre sabe dizer
 * "perto do Atakarejo", mesmo sem saber a rua. A busca prefere o que fica
 * perto do bairro informado e avisa quando o nome existe em vários lugares.
 */
export function PontoReferencia(p: Props) {
    const [achados, setAchados] = useState<LugarEncontrado[] | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [buscando, setBuscando] = useState(false);

    function localizar() {
        setAviso(null);
        setBuscando(true);
        buscarJson<LugarEncontrado[]>(
            referencia.url({
                query: {
                    q: p.textoReferencia,
                    ...(p.bairro.trim() ? { bairro: p.bairro } : {}),
                    ...(p.ponto ? { lat: p.ponto[0], lng: p.ponto[1] } : {}),
                },
            }),
        )
            .then((r) => {
                setAchados(r);
                setAviso(
                    r.length === 0
                        ? 'Nenhum lugar com esse nome. Tente outra referência ou só a rua.'
                        : null,
                );
            })
            .catch((e: Error) => setAviso(e.message))
            .finally(() => setBuscando(false));
    }

    return (
        <div className="space-y-1">
            <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-black">
                    2. Ponto de referência{' '}
                    <span className="font-normal text-neutral-600">
                        — "fica perto de quê?"
                    </span>
                </span>
                <span className="flex gap-1">
                    <input
                        className={campo}
                        value={p.textoReferencia}
                        onChange={(e) => p.onTextoReferencia(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                localizar();
                            }
                        }}
                        placeholder="Ex.: atakarejo, igreja universal, escola..."
                    />
                    <button
                        type="button"
                        className={botaoSecundario}
                        disabled={
                            buscando || p.textoReferencia.trim().length < 3
                        }
                        onClick={localizar}
                    >
                        {buscando ? '…' : 'Localizar'}
                    </button>
                </span>
            </label>
            {p.erro && (
                <span className="block text-[10px] text-red-600">{p.erro}</span>
            )}
            {aviso && <p className="text-[10px] text-orange-700">{aviso}</p>}
            {achados && achados.length > 0 && (
                <ul className="divide-y divide-neutral-100 rounded border border-neutral-300 text-[11px]">
                    {achados.map((a) => (
                        <li
                            key={`${a.origem}${a.lat},${a.lng}`}
                            className="flex items-center justify-between gap-2 px-2 py-1"
                        >
                            <span className="min-w-0">
                                <b>{a.nome}</b>{' '}
                                <span className="text-neutral-600">
                                    {a.endereco}
                                </span>
                                {a.km != null && (
                                    <span className="text-neutral-500">
                                        {' '}
                                        · {a.km} km
                                    </span>
                                )}
                                <Homonimo n={a.homonimos} />
                                {a.origem === 'google' && (
                                    <span className="ml-1 text-[9px] text-neutral-400">
                                        GOOGLE
                                    </span>
                                )}
                            </span>
                            <button
                                type="button"
                                className={botaoSecundario}
                                onClick={() => {
                                    p.onUsarLugar(
                                        a.lat,
                                        a.lng,
                                        a.bairro,
                                        a.nome,
                                        a.origem,
                                    );
                                    setAchados(null);
                                }}
                            >
                                É este
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const normalizar = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

/**
 * Quadro "confira com o solicitante": depois do local marcado, mostra o
 * endereço e o bairro pelo mapa, as ruas em volta (clicáveis: o TARM lê os
 * nomes em voz alta até o solicitante reconhecer a dele) e os lugares perto.
 */
export function ConferenciaLocal({
    ponto,
    arredores,
    carregando,
    ruas,
    avisoRuas,
    bairroDigitado,
    enderecoDigitado,
    onUsarBairro,
    onEscolherRua,
}: {
    ponto: [number, number] | null;
    arredores: Arredores | null;
    carregando: boolean;
    ruas: Rua[] | null;
    avisoRuas: string | null;
    bairroDigitado: string;
    enderecoDigitado: string;
    onUsarBairro: (b: string) => void;
    onEscolherRua: (r: Rua) => void;
}) {
    if (!ponto) {
        return null;
    }

    const bairroDiverge =
        arredores?.bairro &&
        bairroDigitado &&
        normalizar(arredores.bairro) !== normalizar(bairroDigitado);

    return (
        <div className="rounded border border-yellow-400 bg-yellow-50 p-2 text-[11px]">
            <div className="mb-1 font-bold text-black uppercase">
                Confira com o solicitante
            </div>

            <div className="mb-1">
                <span className="font-bold">É numa destas ruas?</span>{' '}
                {ruas === null ? (
                    <span className="text-neutral-600">
                        {avisoRuas ?? 'procurando ruas em volta…'}
                    </span>
                ) : ruas.length === 0 ? (
                    <span className="text-neutral-600">
                        nenhuma rua com nome a menos de 250 m
                    </span>
                ) : (
                    <span className="mt-0.5 flex flex-wrap gap-1">
                        {ruas.map((r) => {
                            const escolhida =
                                enderecoDigitado &&
                                normalizar(enderecoDigitado).startsWith(
                                    normalizar(r.nome),
                                );

                            return (
                                <button
                                    key={r.nome}
                                    type="button"
                                    onClick={() => onEscolherRua(r)}
                                    title={
                                        r.homonimos
                                            ? `Há ${r.homonimos} outra(s) rua(s) com este nome em Salvador`
                                            : undefined
                                    }
                                    className={`rounded border px-1.5 py-0.5 text-left ${
                                        escolhida
                                            ? 'border-black bg-yellow-400 font-bold'
                                            : 'border-yellow-500 bg-white hover:bg-yellow-200'
                                    }`}
                                >
                                    {r.nome}{' '}
                                    <span className="text-neutral-500">
                                        {r.metros} m
                                    </span>
                                    {r.homonimos ? (
                                        <span className="ml-0.5 font-bold">
                                            ⚠
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </span>
                )}
            </div>

            {carregando && !arredores && (
                <p className="text-neutral-600">Procurando lugares em volta…</p>
            )}
            {arredores && (
                <div className="space-y-1">
                    {arredores.endereco && (
                        <p>
                            No mapa: <b>{arredores.endereco}</b>
                        </p>
                    )}
                    {arredores.bairro && (
                        <p
                            className={
                                bairroDiverge ? 'font-bold text-red-700' : ''
                            }
                        >
                            {bairroDiverge && (
                                <AlertTriangle className="mr-1 inline size-3" />
                            )}
                            Bairro pelo mapa: {arredores.bairro}
                            {bairroDiverge && (
                                <>
                                    {' '}
                                    (digitado: {bairroDigitado}){' '}
                                    <button
                                        type="button"
                                        className="rounded bg-yellow-300 px-1.5 text-black hover:bg-yellow-400"
                                        onClick={() =>
                                            onUsarBairro(arredores.bairro!)
                                        }
                                    >
                                        usar {arredores.bairro}
                                    </button>
                                </>
                            )}
                        </p>
                    )}
                    {arredores.referencias.length > 0 && (
                        <div>
                            <span className="font-bold">
                                Pergunte: "fica perto de…?"
                            </span>
                            <ol className="mt-0.5 grid gap-x-3 sm:grid-cols-2">
                                {arredores.referencias.map((r, i) => (
                                    <li
                                        key={`${r.nome}${i}`}
                                        className="truncate"
                                    >
                                        <b>{i + 1}.</b> {r.nome}{' '}
                                        <span className="text-neutral-600">
                                            {r.tipo && `${r.tipo} · `}
                                            {r.metros} m
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                    {arredores.avisos.map((a) => (
                        <p key={a} className="text-orange-700">
                            {a}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
