import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { buscarJson } from '@/lib/buscar-json';
import { referencia } from '@/routes/atendimento';
import type { Arredores, LugarEncontrado, Rua } from '@/types';
import { botaoSecundario, campo } from './estilos';

type Props = {
    textoReferencia: string;
    onTextoReferencia: (t: string) => void;
    ponto: [number, number] | null;
    arredores: Arredores | null;
    carregando: boolean;
    ruas: Rua[] | null;
    avisoRuas: string | null;
    bairroDigitado: string;
    onUsarBairro: (b: string) => void;
    onUsarLugar: (lat: number, lng: number) => void;
    erro?: string;
};

function metrosEntre(a: [number, number], b: [number, number]): number {
    const r = 6371000;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLng = ((b[1] - a[1]) * Math.PI) / 180;
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a[0] * Math.PI) / 180) *
            Math.cos((b[0] * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;

    return Math.round(2 * r * Math.asin(Math.sqrt(h)));
}

const normalizar = (s: string) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

/**
 * Ponto de referência (também serve para achar o local quando o endereço
 * não ajuda) e o painel "confira com o solicitante": bairro pelo mapa,
 * ruas e lugares conhecidos em volta do ponto marcado.
 */
export function ConferenciaLocal(p: Props) {
    const [achados, setAchados] = useState<LugarEncontrado[] | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);

    function localizar() {
        setAviso(null);
        buscarJson<LugarEncontrado[]>(
            referencia.url({
                query: {
                    q: p.textoReferencia,
                    ...(p.ponto ? { lat: p.ponto[0], lng: p.ponto[1] } : {}),
                },
            }),
        )
            .then((r) => {
                setAchados(r);
                setAviso(r.length === 0 ? 'Nenhum lugar com esse nome.' : null);
            })
            .catch((e: Error) => setAviso(e.message));
    }

    const bairroDiverge =
        p.arredores?.bairro &&
        p.bairroDigitado &&
        normalizar(p.arredores.bairro) !== normalizar(p.bairroDigitado);

    return (
        <div className="space-y-2">
            <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-black">
                    Ponto de referência
                </span>
                <span className="flex gap-1">
                    <input
                        className={campo}
                        value={p.textoReferencia}
                        onChange={(e) => p.onTextoReferencia(e.target.value)}
                        placeholder="Ex.: perto do mercado Atakarejo, igreja..."
                    />
                    <button
                        type="button"
                        className={botaoSecundario}
                        disabled={p.textoReferencia.trim().length < 3}
                        onClick={localizar}
                        title="Procurar esse lugar no mapa"
                    >
                        Localizar
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
                            key={`${a.lat},${a.lng}`}
                            className="flex items-center justify-between gap-2 px-2 py-1"
                        >
                            <span className="min-w-0 truncate">
                                <b>{a.nome}</b>{' '}
                                <span className="text-neutral-600">
                                    {a.endereco}
                                </span>
                                {p.ponto && (
                                    <span className="text-neutral-500">
                                        {' '}
                                        · {metrosEntre(p.ponto, [
                                            a.lat,
                                            a.lng,
                                        ])}{' '}
                                        m do local marcado
                                    </span>
                                )}
                            </span>
                            <button
                                type="button"
                                className={botaoSecundario}
                                onClick={() => {
                                    p.onUsarLugar(a.lat, a.lng);
                                    setAchados(null);
                                }}
                            >
                                {p.ponto ? 'Mover local' : 'Usar'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {p.ponto && (
                <div className="rounded border border-yellow-400 bg-yellow-50 p-2 text-[11px]">
                    <div className="mb-1 font-bold text-black uppercase">
                        Confira com o solicitante
                    </div>
                    <p>
                        <span className="font-bold">Ruas perto:</span>{' '}
                        {p.ruas === null
                            ? (p.avisoRuas ?? 'procurando…')
                            : p.ruas.length === 0
                              ? 'nenhuma rua com nome a menos de 250 m'
                              : p.ruas
                                    .map((r) => `${r.nome} (${r.metros} m)`)
                                    .join(' · ')}
                    </p>
                    {p.carregando && !p.arredores && (
                        <p className="text-neutral-600">
                            Procurando ruas e lugares em volta…
                        </p>
                    )}
                    {p.arredores && (
                        <div className="space-y-1">
                            {p.arredores.endereco && (
                                <p>
                                    No mapa: <b>{p.arredores.endereco}</b>
                                </p>
                            )}
                            {p.arredores.bairro && (
                                <p
                                    className={
                                        bairroDiverge
                                            ? 'font-bold text-red-700'
                                            : ''
                                    }
                                >
                                    {bairroDiverge && (
                                        <AlertTriangle className="mr-1 inline size-3" />
                                    )}
                                    Bairro pelo mapa: {p.arredores.bairro}
                                    {bairroDiverge && (
                                        <>
                                            {' '}
                                            (digitado: {p.bairroDigitado}){' '}
                                            <button
                                                type="button"
                                                className="rounded bg-yellow-300 px-1.5 text-black hover:bg-yellow-400"
                                                onClick={() =>
                                                    p.onUsarBairro(
                                                        p.arredores!.bairro!,
                                                    )
                                                }
                                            >
                                                usar {p.arredores.bairro}
                                            </button>
                                        </>
                                    )}
                                </p>
                            )}
                            {p.arredores.referencias.length > 0 && (
                                <div>
                                    <span className="font-bold">
                                        Pergunte: "fica perto de…?"
                                    </span>
                                    <ol className="mt-0.5 grid gap-x-3 sm:grid-cols-2">
                                        {p.arredores.referencias.map((r, i) => (
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
                            {p.arredores.avisos.map((a) => (
                                <p key={a} className="text-orange-700">
                                    {a}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
