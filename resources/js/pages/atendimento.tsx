import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { CampoBairro } from '@/components/samu/atendimento/campo-bairro';
import { CampoEndereco } from '@/components/samu/atendimento/campo-endereco';
import { ChegamPrimeiro } from '@/components/samu/atendimento/chegam-primeiro';
import {
    ConferenciaLocal,
    PontoReferencia,
} from '@/components/samu/atendimento/conferencia-local';
import { botaoSecundario, campo } from '@/components/samu/atendimento/estilos';
import { MapaAtendimento } from '@/components/samu/mapa';
import { TabelaOcorrencias } from '@/components/samu/tabela-ocorrencias';
import { tabelas } from '@/components/samu/tabelas';
import { buscarJson } from '@/lib/buscar-json';
import {
    arredores as rotaArredores,
    estimativas,
    ruas as rotaRuas,
} from '@/routes/atendimento';
import { store } from '@/routes/atendimento/ocorrencias';
import type {
    Arredores,
    BairroSugerido,
    BaseMapa,
    ConfigMapas,
    Estimativa,
    Linha,
    Lugar,
    Rua,
} from '@/types';

type Vitima = { nome: string; idade: string; sexo: '' | 'M' | 'F' };
type LocalizadoPor = 'endereco' | 'referencia' | 'mapa';

const vitimaVazia: Vitima = { nome: '', idade: '', sexo: '' };

function Rotulo({
    titulo,
    erro,
    children,
}: {
    titulo: ReactNode;
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
    mapas,
    tabelas: dados,
}: {
    bases: BaseMapa[];
    mapas: ConfigMapas;
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
        localizado_por: null as LocalizadoPor | null,
        vitimas: [{ ...vitimaVazia }] as Vitima[],
    });
    const [bairroReconhecido, setBairroReconhecido] =
        useState<BairroSugerido | null>(null);
    const [estimativa, setEstimativa] = useState<Estimativa | null>(null);
    const [arredores, setArredores] = useState<Arredores | null>(null);
    const [carregandoArredores, setCarregandoArredores] = useState(false);
    const [ruas, setRuas] = useState<Rua[] | null>(null);
    const [avisoRuas, setAvisoRuas] = useState<string | null>(null);
    const { lat, lng } = form.data;
    const ponto: [number, number] | null =
        lat !== null && lng !== null ? [lat, lng] : null;

    // Local mudou: quem chega primeiro, ruas e lugares em volta para conferir.
    useEffect(() => {
        setArredores(null);
        setEstimativa(null);
        setRuas(null);
        setAvisoRuas(null);

        if (lat === null || lng === null) {
            return;
        }

        const query = { query: { lat, lng } };
        buscarJson<Estimativa>(estimativas.url(query))
            .then(setEstimativa)
            .catch(() => setEstimativa(null));
        buscarJson<Rua[]>(rotaRuas.url(query))
            .then(setRuas)
            .catch((e: Error) => setAvisoRuas(e.message));

        setCarregandoArredores(true);
        buscarJson<Arredores>(rotaArredores.url(query))
            .then((a) => {
                setArredores(a);

                // Bairro em branco: preenche com o do mapa.
                if (a.bairro) {
                    form.setData((d) =>
                        d.bairro.trim() === ''
                            ? { ...d, bairro: a.bairro! }
                            : d,
                    );
                }
            })
            .catch(() => setArredores(null))
            .finally(() => setCarregandoArredores(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng]);

    const marcar = useCallback(
        (lat: number, lng: number, por: LocalizadoPor = 'mapa') =>
            form.setData((d) => ({ ...d, lat, lng, localizado_por: por })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    function escolherEndereco(l: Lugar) {
        form.setData((d) => ({
            ...d,
            endereco:
                [l.logradouro, l.numero].filter(Boolean).join(', ') || l.rotulo,
            bairro: l.bairro ?? d.bairro,
            lat: l.lat,
            lng: l.lng,
            localizado_por: 'endereco',
        }));
    }

    // Rua reconhecida pelo solicitante na lista "é numa destas ruas?".
    function escolherRua(r: Rua) {
        form.setData((d) => ({
            ...d,
            endereco: r.nome,
            bairro: d.bairro.trim() === '' && r.bairro ? r.bairro : d.bairro,
            ...(r.lat !== undefined && r.lng !== undefined
                ? { lat: r.lat, lng: r.lng }
                : {}),
            localizado_por: d.localizado_por ?? 'referencia',
        }));
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
                setBairroReconhecido(null);
            },
        });
    }

    const erro = (chave: string) =>
        (form.errors as Record<string, string>)[chave];

    return (
        <>
            <Head title="Atendimento" />

            <div className="grid gap-4 xl:grid-cols-[500px_1fr]">
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

                    <fieldset className="space-y-2 rounded border border-neutral-200 p-2">
                        <legend className="px-1 text-[10px] font-bold tracking-wider text-neutral-700 uppercase">
                            Local — nesta ordem, e siga mesmo sem saber tudo
                        </legend>

                        <CampoBairro
                            valor={form.data.bairro}
                            erro={form.errors.bairro}
                            onMudar={(b) => form.setData('bairro', b)}
                            onReconhecer={setBairroReconhecido}
                        />

                        <PontoReferencia
                            bairro={form.data.bairro}
                            textoReferencia={form.data.ponto_referencia}
                            onTextoReferencia={(t) =>
                                form.setData('ponto_referencia', t)
                            }
                            ponto={ponto}
                            onUsarLugar={(lat, lng, bairro) => {
                                marcar(lat, lng, 'referencia');
                                if (bairro && form.data.bairro.trim() === '') {
                                    form.setData('bairro', bairro);
                                }
                            }}
                            erro={form.errors.ponto_referencia}
                        />

                        <CampoEndereco
                            valor={form.data.endereco}
                            bairro={form.data.bairro}
                            ponto={ponto}
                            erro={form.errors.endereco}
                            provedor={mapas.provedor}
                            onDigitar={(t) => form.setData('endereco', t)}
                            onEscolher={escolherEndereco}
                        />

                        <ConferenciaLocal
                            ponto={ponto}
                            arredores={arredores}
                            carregando={carregandoArredores}
                            ruas={ruas}
                            avisoRuas={avisoRuas}
                            bairroDigitado={form.data.bairro}
                            enderecoDigitado={form.data.endereco}
                            onUsarBairro={(b) => form.setData('bairro', b)}
                            onEscolherRua={escolherRua}
                        />

                        <div className="grid grid-cols-[1fr_140px] gap-2">
                            <p className="self-end text-[10px] text-neutral-600">
                                {ponto
                                    ? `Local marcado ${form.data.localizado_por === 'referencia' ? 'pelo ponto de referência' : form.data.localizado_por === 'endereco' ? 'pelo endereço' : 'no mapa'} — arraste o ponto vermelho para ajustar.`
                                    : 'Sem local no mapa: escolha uma sugestão, localize a referência ou clique no mapa. Se não der, abra assim mesmo.'}
                            </p>
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
                    </fieldset>

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
                                className={`flex items-center gap-1 ${botaoSecundario}`}
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

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full rounded border border-b-4 border-yellow-600 bg-yellow-400 py-2 text-xs font-bold text-black uppercase shadow-md transition-all hover:bg-yellow-300 active:translate-y-0.5 active:border-b disabled:opacity-60"
                    >
                        {form.processing
                            ? 'Abrindo…'
                            : ponto
                              ? 'Abrir ocorrência'
                              : 'Abrir ocorrência sem local no mapa'}
                    </button>
                </form>

                <div className="space-y-3">
                    <MapaAtendimento
                        config={mapas}
                        bases={bases}
                        ponto={ponto}
                        centro={
                            bairroReconhecido
                                ? [bairroReconhecido.lat, bairroReconhecido.lng]
                                : null
                        }
                        estimativa={estimativa}
                        arredores={arredores}
                        ruas={ruas ?? []}
                        onMarcar={marcar}
                    />
                    <ChegamPrimeiro estimativa={estimativa} />
                </div>
            </div>

            <TabelaOcorrencias
                {...tabelas.chamados}
                linhas={dados.chamados ?? []}
            />
        </>
    );
}
