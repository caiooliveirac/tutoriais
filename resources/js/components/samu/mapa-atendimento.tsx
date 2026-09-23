import 'leaflet/dist/leaflet.css';
import type { LayerGroup, Map as LeafletMap, Marker } from 'leaflet';
import { useEffect, useRef } from 'react';
import type { BaseMapa, Estimativa } from '@/types';

const SALVADOR: [number, number] = [-12.95, -38.46];

type Props = {
    bases: BaseMapa[];
    ponto: [number, number] | null;
    estimativa: Estimativa | null;
    onMarcar: (lat: number, lng: number) => void;
};

/**
 * Mapa de Salvador (Leaflet + OpenStreetMap). Bases em laranja com o tempo
 * até o local; o local da ocorrência em vermelho, arrastável. Clique marca.
 * Leaflet é importado só no navegador (usa window).
 */
export function MapaAtendimento({ bases, ponto, estimativa, onMarcar }: Props) {
    const elemento = useRef<HTMLDivElement>(null);
    const mapa = useRef<LeafletMap | null>(null);
    const camadaBases = useRef<LayerGroup | null>(null);
    const marcador = useRef<Marker | null>(null);
    const leaflet = useRef<typeof import('leaflet') | null>(null);
    const marcar = useRef(onMarcar);

    useEffect(() => {
        marcar.current = onMarcar;
    }, [onMarcar]);

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
            camadaBases.current = L.layerGroup().addTo(mapa.current);
            mapa.current.on('click', (e) =>
                marcar.current(e.latlng.lat, e.latlng.lng),
            );
            desenharBases();
        });

        return () => {
            cancelado = true;
            mapa.current?.remove();
            mapa.current = null;
            marcador.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function desenharBases() {
        const L = leaflet.current;

        if (!L || !camadaBases.current) {
            return;
        }

        camadaBases.current.clearLayers();
        const tempos = new Map(estimativa?.bases.map((b) => [b.nome, b]) ?? []);

        for (const base of bases) {
            const t = tempos.get(base.nome);
            L.circleMarker([base.lat, base.lng], {
                radius: 7,
                color: '#000',
                weight: 1,
                fillColor: t && t.livres.length === 0 ? '#a3a3a3' : '#f97316',
                fillOpacity: 1,
            })
                .bindTooltip(
                    t
                        ? `<b>${base.nome}</b><br>${t.minutos} min · ${t.km} km<br>${t.livres.join(', ') || 'sem unidade livre'}`
                        : `<b>${base.nome}</b>`,
                    { permanent: false },
                )
                .addTo(camadaBases.current);
        }

        for (const u of estimativa?.unidades.filter(
            (u) => u.origem === 'posicao',
        ) ?? []) {
            L.circleMarker([u.lat, u.lng], {
                radius: 5,
                color: '#000',
                fillColor: '#facc15',
                fillOpacity: 1,
                weight: 1,
            })
                .bindTooltip(`${u.codigo} (em movimento) · ${u.minutos} min`)
                .addTo(camadaBases.current);
        }
    }

    useEffect(desenharBases, [bases, estimativa]);

    useEffect(() => {
        const L = leaflet.current;

        if (!L || !mapa.current || !ponto) {
            return;
        }

        if (!marcador.current) {
            marcador.current = L.marker(ponto, {
                draggable: true,
                icon: L.divIcon({
                    className: '',
                    html: '<div style="width:18px;height:18px;border-radius:9999px;background:#dc2626;border:3px solid #fff;box-shadow:0 0 0 2px #000"></div>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
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

        mapa.current.setView(ponto, Math.max(mapa.current.getZoom(), 14));
    }, [ponto]);

    return (
        <div
            ref={elemento}
            className="h-[420px] w-full rounded border border-neutral-300"
        />
    );
}
