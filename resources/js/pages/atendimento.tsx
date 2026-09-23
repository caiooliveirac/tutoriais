import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapaAtendimento } from '@/components/samu/mapa-atendimento';
import { TabelaOcorrencias } from '@/components/samu/tabela-ocorrencias';
import { tabelas } from '@/components/samu/tabelas';
import { estimativas, geocodificar } from '@/routes/atendimento';
import { store } from '@/routes/atendimento/ocorrencias';
import type { BaseMapa, EnderecoEncontrado, Estimativa, Linha } from '@/types';

type Vitima = { nome: string; idade: string; sexo: '' | 'M' | 'F' };

const vitimaVazia: Vitima = { nome: '', idade: '', sexo: '' };

const campo =
    'w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-xs text-black focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none';

async function buscarJson<T>(url: string): Promise<T> {
    const resposta = await fetch(url, {
        headers: { Accept: 'application/json' },
    });

    if (!resposta.ok) {
        throw new Error(String(resposta.status));
    }

    return (await resposta.json()) as T;
}

function Rotulo({
    titulo,
    erro,
    children,
}: {
    titulo: string;
    erro?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-black">
                {titulo}
            </span>
            {children}
            {erro && (
                <span className="mt-0.5 block text-[10px] text-red-600">
                    {erro}
                </span>
            )}
        </label>
    );
}

export default function Atendimento({
    bases,
    tabelas: dados,
}: {
    bases: BaseMapa[];
    tabelas: Record<string, Linha[]>;
}) {
    const form = useForm({
        telefone: '',
        solicitante: '',
        cidade: 'Salvador',
        bairro: '',
        endereco: '',
        ponto_referencia: '',
        queixa: '',
        lat: null as number | null,
        lng: null as number | null,
        vitimas: [{ ...vitimaVazia }] as Vitima[],
    });
    const [sugestoes, setSugestoes] = useState<EnderecoEncontrado[]>([]);
    const [avisoBusca, setAvisoBusca] = useState<string | null>(null);
    const [estimativa, setEstimativa] = useState<Estimativa | null>(null);
    const enderecoEscolhido = useRef<string | null>(null);
    const ponto: [number, number] | null =
        form.data.lat !== null && form.data.lng !== null
            ? [form.data.lat, form.data.lng]
            : null;

    // Busca o endereço enquanto o TARM digita (pausa de 700 ms; o servidor guarda em cache).
    useEffect(() => {
        const texto = form.data.endereco.trim();

        if (texto.length < 6 || texto === enderecoEscolhido.current) {
            setSugestoes([]);

            return;
        }

        const espera = setTimeout(() => {
            buscarJson<EnderecoEncontrado[]>(
                geocodificar.url({ query: { q: texto } }),
            )
                .then((r) => {
                    setSugestoes(r);
                    setAvisoBusca(
                        r.length === 0
                            ? 'Endereço não encontrado: marque o local no mapa.'
                            : null,
                    );
                })
                .catch(() =>
                    setAvisoBusca(
                        'Busca de endereço indisponível: marque o local no mapa.',
                    ),
                );
        }, 700);

        return () => clearTimeout(espera);
    }, [form.data.endereco]);

    // Recalcula quem chega primeiro sempre que o local muda.
    useEffect(() => {
        if (!ponto) {
            setEstimativa(null);

            return;
        }

        buscarJson<Estimativa>(
            estimativas.url({ query: { lat: ponto[0], lng: ponto[1] } }),
        )
            .then(setEstimativa)
            .catch(() => setEstimativa(null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.lat, form.data.lng]);

    const marcar = useCallback(
        (lat: number, lng: number) => form.setData((d) => ({ ...d, lat, lng })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    function escolher(e: EnderecoEncontrado) {
        const endereco =
            [e.logradouro, e.numero].filter(Boolean).join(', ') || e.rotulo;
        enderecoEscolhido.current = endereco;
        form.setData((d) => ({
            ...d,
            endereco,
            bairro: e.bairro ?? d.bairro,
            lat: e.lat,
            lng: e.lng,
        }));
        setSugestoes([]);
    }

    function vitima(i: number, mudanca: Partial<Vitima>) {
        form.setData(
            'vitimas',
            form.data.vitimas.map((v, j) =>
                j === i ? { ...v, ...mudanca } : v,
            ),
        );
    }

    function enviar(e: FormEvent) {
        e.preventDefault();
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setEstimativa(null);
            },
        });
    }

    const erro = (chave: string) =>
        (form.errors as Record<string, string>)[chave];

    return (
        <>
            <Head title="Atendimento" />

            <div className="grid gap-4 xl:grid-cols-[460px_1fr]">
                <form
                    onSubmit={enviar}
                    className="space-y-3 rounded border border-neutral-200 bg-white p-4 shadow-sm"
                >
                    <div>
                        <h2 className="text-xs font-bold tracking-wider text-black uppercase">
                            Novo chamado
                        </h2>
                        <div className="mt-1 h-[2px] bg-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Rotulo titulo="Telefone" erro={form.errors.telefone}>
                            <input
                                className={campo}
                                value={form.data.telefone}
                                onChange={(e) =>
                                    form.setData('telefone', e.target.value)
                                }
                                placeholder="(71) 9...."
                                autoFocus
                            />
                        </Rotulo>
                        <Rotulo
                            titulo="Solicitante"
                            erro={form.errors.solicitante}
                        >
                            <input
                                className={campo}
                                value={form.data.solicitante}
                                onChange={(e) =>
                                    form.setData('solicitante', e.target.value)
                                }
                                placeholder="Nome (vínculo)"
                            />
                        </Rotulo>
                    </div>

                    <div className="relative">
                        <Rotulo titulo="Endereço" erro={form.errors.endereco}>
                            <input
                                className={campo}
                                value={form.data.endereco}
                                onChange={(e) =>
                                    form.setData('endereco', e.target.value)
                                }
                                placeholder="Rua, número"
                                autoComplete="off"
                            />
                        </Rotulo>
                        {sugestoes.length > 0 && (
                            <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded border border-neutral-300 bg-white shadow-lg">
                                {sugestoes.map((s) => (
                                    <li key={`${s.lat},${s.lng}`}>
                                        <button
                                            type="button"
                                            onClick={() => escolher(s)}
                                            className="block w-full px-2 py-1.5 text-left text-xs hover:bg-orange-50"
                                        >
                                            {s.rotulo}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {avisoBusca && (
                            <p className="mt-0.5 text-[10px] text-orange-700">
                                {avisoBusca}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Rotulo titulo="Bairro" erro={form.errors.bairro}>
                            <input
                                className={campo}
                                value={form.data.bairro}
                                onChange={(e) =>
                                    form.setData('bairro', e.target.value)
                                }
                            />
                        </Rotulo>
                        <Rotulo titulo="Cidade" erro={form.errors.cidade}>
                            <input
                                className={campo}
                                value={form.data.cidade}
                                onChange={(e) =>
                                    form.setData('cidade', e.target.value)
                                }
                            />
                        </Rotulo>
                    </div>

                    <Rotulo
                        titulo="Ponto de referência"
                        erro={form.errors.ponto_referencia}
                    >
                        <input
                            className={campo}
                            value={form.data.ponto_referencia}
                            onChange={(e) =>
                                form.setData('ponto_referencia', e.target.value)
                            }
                        />
                    </Rotulo>

                    <Rotulo titulo="Queixa" erro={form.errors.queixa}>
                        <input
                            className={campo}
                            value={form.data.queixa}
                            onChange={(e) =>
                                form.setData('queixa', e.target.value)
                            }
                            placeholder="Ex.: DOR TORÁCICA"
                        />
                    </Rotulo>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-black">
                                Vítimas
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    form.setData('vitimas', [
                                        ...form.data.vitimas,
                                        { ...vitimaVazia },
                                    ])
                                }
                                className="flex items-center gap-1 rounded border border-b-2 border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase hover:bg-neutral-50"
                            >
                                <Plus size={12} /> Inserir vítima
                            </button>
                        </div>
                        {form.data.vitimas.map((v, i) => (
                            <div
                                key={i}
                                className="mb-1 grid grid-cols-[1fr_60px_70px_24px] gap-1"
                            >
                                <input
                                    className={campo}
                                    placeholder="Nome (ou NÃO IDENTIFICADO)"
                                    value={v.nome}
                                    onChange={(e) =>
                                        vitima(i, { nome: e.target.value })
                                    }
                                />
                                <input
                                    className={campo}
                                    placeholder="Idade"
                                    inputMode="numeric"
                                    value={v.idade}
                                    onChange={(e) =>
                                        vitima(i, {
                                            idade: e.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        })
                                    }
                                />
                                <select
                                    className={campo}
                                    value={v.sexo}
                                    onChange={(e) =>
                                        vitima(i, {
                                            sexo: e.target
                                                .value as Vitima['sexo'],
                                        })
                                    }
                                >
                                    <option value="">Sexo</option>
                                    <option value="M">M</option>
                                    <option value="F">F</option>
                                </select>
                                <button
                                    type="button"
                                    title="Remover vítima"
                                    disabled={form.data.vitimas.length === 1}
                                    onClick={() =>
                                        form.setData(
                                            'vitimas',
                                            form.data.vitimas.filter(
                                                (_, j) => j !== i,
                                            ),
                                        )
                                    }
                                    className="flex items-center justify-center text-neutral-500 hover:text-red-600 disabled:opacity-30"
                                >
                                    <Trash2 size={14} />
                                </button>
                                {erro(`vitimas.${i}.idade`) && (
                                    <span className="col-span-4 text-[10px] text-red-600">
                                        {erro(`vitimas.${i}.idade`)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[10px] text-neutral-600">
                        {ponto
                            ? `Local marcado: ${ponto[0].toFixed(5)}, ${ponto[1].toFixed(5)} — arraste o ponto vermelho para ajustar.`
                            : 'Escolha um endereço sugerido ou clique no mapa para marcar o local.'}
                        {erro('lat') && (
                            <span className="block text-red-600">
                                {erro('lat')}
                            </span>
                        )}
                    </p>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded border border-b-4 border-yellow-600 bg-yellow-400 py-2 text-xs font-bold text-black uppercase shadow-md transition-all hover:bg-yellow-300 active:translate-y-0.5 active:border-b disabled:opacity-60"
                    >
                        {form.processing ? 'Abrindo…' : 'Abrir ocorrência'}
                    </button>
                </form>

                <div className="space-y-3">
                    <MapaAtendimento
                        bases={bases}
                        ponto={ponto}
                        estimativa={estimativa}
                        onMarcar={marcar}
                    />

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
                                Marque o local para ver as unidades mais
                                próximas.
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
                </div>
            </div>

            <TabelaOcorrencias
                {...tabelas.chamados}
                linhas={dados.chamados ?? []}
            />
        </>
    );
}
