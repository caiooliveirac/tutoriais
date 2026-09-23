import 'leaflet/dist/leaflet.css';
import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import { useEffect, useRef } from 'react';
import type { PropsMapa } from './tipos';
import { CORES, RUAS_ROTULADAS, SALVADOR, textoBase } from './tipos';

/**
 * Mapa OpenStreetMap (Leaflet), usado quando não há chave do Google.
 * Leaflet é importado só no navegador (usa window).
 */
export function MapaOsm({
    bases,
    ponto,
    estimativa,
    arredores,
    ruas,
    onMarcar,
}: PropsMapa) {
    const elemento = useRef<HTMLDivElement>(null);
    const mapa = useRef<LeafletMap | null>(null);
    const camada = useRef<LayerGroup | null>(null);
    const marcador = useRef<Marker | null>(null);
    const leaflet = useRef<typeof import('leaflet') | null>(null);
    const marcar = useRef(onMarcar);
    const redesenhar = useRef<() => void>(() => {});

    useEffect(() => {
        marcar.current = onMarcar;
    }, [onMarcar]);

    redesenhar.current = () => {
        const L = leaflet.current;

        if (!L || !camada.current) {
            return;
        }

        camada.current.clearLayers();

        ruas.forEach((rua, i) => {
            rua.trechos.forEach((trecho, j) => {
                const linha = L.polyline(trecho, {
                    color: CORES.rua,
                    weight: 7,
                    opacity: 0.75,
                })
                    .bindTooltip(`${rua.nome} (${rua.metros} m)`, {
                        permanent: i < RUAS_ROTULADAS && j === 0,
                        direction: 'center',
                        className: 'rotulo-rua',
                    })
                    .addTo(camada.current!);
                linha.bringToBack();
            });
        });

        arredores?.referencias.forEach((ref, i) => {
            L.marker([ref.lat, ref.lng], {
                icon: L.divIcon({
                    className: '',
                    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${CORES.referencia};color:#fff;font:bold 10px/18px sans-serif;text-align:center">${i + 1}</div>`,
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                }),
            })
                .bindTooltip(`${i + 1}. ${ref.nome} (${ref.metros} m)`)
                .addTo(camada.current!);
        });

        for (const base of bases) {
            const { texto, semLivre } = textoBase(base.nome, estimativa);
            L.circleMarker([base.lat, base.lng], {
                radius: 7,
                color: '#000',
                weight: 1,
                fillColor: semLivre ? CORES.baseSemLivre : CORES.base,
                fillOpacity: 1,
            })
                .bindTooltip(texto)
                .addTo(camada.current);
        }

        for (const u of estimativa?.unidades.filter(
            (u) => u.origem === 'posicao',
        ) ?? []) {
            L.circleMarker([u.lat, u.lng], {
                radius: 5,
                color: '#000',
                fillColor: CORES.emMovimento,
                fillOpacity: 1,
                weight: 1,
            })
                .bindTooltip(`${u.codigo} (em movimento) · ${u.minutos} min`)
                .addTo(camada.current);
        }
    };

    useEffect(() => {
        let cancelado = false;

        void import('leaflet').then((L) => {
            if (cancelado || !elemento.current || mapa.current) {
                return;
            }

            leaflet.current = L;
            mapa.current = L.map(elemento.current).setView(SALVADOR, 12);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap',
            }).addTo(mapa.current);
            camada.current = L.layerGroup().addTo(mapa.current);
            mapa.current.on('click', (e) =>
                marcar.current(e.latlng.lat, e.latlng.lng),
            );
            redesenhar.current();
        });

        return () => {
            cancelado = true;
            mapa.current?.remove();
            mapa.current = null;
            marcador.current = null;
        };
    }, []);

    useEffect(() => redesenhar.current(), [bases, estimativa, arredores, ruas]);

    useEffect(() => {
        const L = leaflet.current;

        if (!L || !mapa.current || !ponto) {
            return;
        }

        if (!marcador.current) {
            marcador.current = L.marker(ponto, {
                draggable: true,
                zIndexOffset: 1000,
                icon: L.divIcon({
                    className: '',
                    html: `<div style="width:20px;height:20px;border-radius:9999px;background:${CORES.ponto};border:3px solid #fff;box-shadow:0 0 0 2px #000"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                }),
            })
                .on('dragend', (e) => {
                    const { lat, lng } = (e.target as Marker).getLatLng();
                    marcar.current(lat, lng);
                })
                .addTo(mapa.current);
        } else {
            marcador.current.setLatLng(ponto);
        }

        mapa.current.setView(ponto, Math.max(mapa.current.getZoom(), 16));
    }, [ponto]);

    return (
        <div
            ref={elemento}
            className="h-[460px] w-full rounded border border-neutral-300"
        />
    );
}
