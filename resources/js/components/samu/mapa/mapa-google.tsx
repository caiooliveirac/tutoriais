/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import type { PropsMapa } from './tipos';
import { CORES, SALVADOR, textoBase } from './tipos';

declare global {
    interface Window {
        __samuGoogleCarregado?: () => void;
    }
}

let carregando: Promise<void> | null = null;

/** Carrega a Maps JavaScript API uma vez (chave do navegador, restrita por referrer). */
function carregarGoogle(chave: string): Promise<void> {
    if ((window as { google?: typeof google }).google?.maps !== undefined) {
        return Promise.resolve();
    }

    carregando ??= new Promise((ok, erro) => {
        window.__samuGoogleCarregado = () => ok();
        const s = document.createElement('script');
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(chave)}&v=weekly&language=pt-BR&region=BR&loading=async&callback=__samuGoogleCarregado`;
        s.async = true;
        s.onerror = () => {
            carregando = null;
            erro(new Error('Google Maps não carregou'));
        };
        document.head.appendChild(s);
    });

    return carregando;
}

function circulo(cor: string, escala: number): google.maps.Symbol {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: escala,
        fillColor: cor,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 1,
    };
}

/**
 * Mapa Google, usado quando há chaves do Google: os termos do Google
 * exigem que lugares e endereços do Google apareçam sobre mapa Google.
 */
export function MapaGoogle({
    chave,
    bases,
    ponto,
    estimativa,
    arredores,
    ruas,
    onMarcar,
}: PropsMapa & { chave: string }) {
    const elemento = useRef<HTMLDivElement>(null);
    const mapa = useRef<google.maps.Map | null>(null);
    const marcador = useRef<google.maps.Marker | null>(null);
    const camada = useRef<(google.maps.Marker | google.maps.Polyline)[]>([]);
    const marcar = useRef(onMarcar);
    const [pronto, setPronto] = useState(false);
    const [falhou, setFalhou] = useState(false);

    useEffect(() => {
        marcar.current = onMarcar;
    }, [onMarcar]);

    useEffect(() => {
        carregarGoogle(chave)
            .then(async () => {
                await google.maps.importLibrary('maps');
                await google.maps.importLibrary('marker');

                if (!elemento.current || mapa.current) {
                    return;
                }

                mapa.current = new google.maps.Map(elemento.current, {
                    center: { lat: SALVADOR[0], lng: SALVADOR[1] },
                    zoom: 12,
                    clickableIcons: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                });
                mapa.current.addListener(
                    'click',
                    (e: google.maps.MapMouseEvent) => {
                        if (e.latLng) {
                            marcar.current(e.latLng.lat(), e.latLng.lng());
                        }
                    },
                );
                setPronto(true);
            })
            .catch(() => setFalhou(true));
    }, [chave]);

    useEffect(() => {
        if (!pronto || !mapa.current) {
            return;
        }

        camada.current.forEach((o) => o.setMap(null));
        camada.current = [];
        const m = mapa.current;

        ruas.forEach((rua) =>
            rua.trechos.forEach((trecho) =>
                camada.current.push(
                    new google.maps.Polyline({
                        map: m,
                        path: trecho.map(([lat, lng]) => ({ lat, lng })),
                        strokeColor: CORES.rua,
                        strokeWeight: 7,
                        strokeOpacity: 0.75,
                        clickable: false,
                        zIndex: 1,
                    }),
                ),
            ),
        );

        arredores?.referencias.forEach((ref, i) =>
            camada.current.push(
                new google.maps.Marker({
                    map: m,
                    position: { lat: ref.lat, lng: ref.lng },
                    icon: circulo(CORES.referencia, 9),
                    label: {
                        text: String(i + 1),
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '700',
                    },
                    title: `${i + 1}. ${ref.nome} (${ref.metros} m)`,
                    zIndex: 5,
                }),
            ),
        );

        for (const base of bases) {
            const { texto, semLivre } = textoBase(base.nome, estimativa);
            camada.current.push(
                new google.maps.Marker({
                    map: m,
                    position: { lat: base.lat, lng: base.lng },
                    icon: circulo(
                        semLivre ? CORES.baseSemLivre : CORES.base,
                        7,
                    ),
                    title: texto,
                    zIndex: 3,
                }),
            );
        }

        for (const u of estimativa?.unidades.filter(
            (u) => u.origem === 'posicao',
        ) ?? []) {
            camada.current.push(
                new google.maps.Marker({
                    map: m,
                    position: { lat: u.lat, lng: u.lng },
                    icon: circulo(CORES.emMovimento, 5),
                    title: `${u.codigo} (em movimento) · ${u.minutos} min`,
                    zIndex: 4,
                }),
            );
        }
    }, [pronto, bases, estimativa, arredores, ruas]);

    useEffect(() => {
        if (!pronto || !mapa.current || !ponto) {
            return;
        }

        const posicao = { lat: ponto[0], lng: ponto[1] };

        if (!marcador.current) {
            marcador.current = new google.maps.Marker({
                map: mapa.current,
                position: posicao,
                draggable: true,
                zIndex: 10,
                icon: {
                    ...circulo(CORES.ponto, 10),
                    strokeColor: '#fff',
                    strokeWeight: 3,
                },
                title: 'Local da ocorrência (arraste para ajustar)',
            });
            marcador.current.addListener(
                'dragend',
                (e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                        marcar.current(e.latLng.lat(), e.latLng.lng());
                    }
                },
            );
        } else {
            marcador.current.setPosition(posicao);
        }

        mapa.current.panTo(posicao);
        mapa.current.setZoom(Math.max(mapa.current.getZoom() ?? 12, 17));
    }, [pronto, ponto]);

    if (falhou) {
        return (
            <div className="flex h-[460px] items-center justify-center rounded border border-red-300 bg-red-50 p-4 text-center text-xs text-red-700">
                O Google Maps não carregou (chave do navegador ausente, sem
                permissão para este endereço ou sem internet).
            </div>
        );
    }

    return (
        <div
            ref={elemento}
            className="h-[460px] w-full rounded border border-neutral-300"
        />
    );
}
