import type { Arredores, BaseMapa, Estimativa } from '@/types';

export type PropsMapa = {
    bases: BaseMapa[];
    ponto: [number, number] | null;
    estimativa: Estimativa | null;
    arredores: Arredores | null;
    onMarcar: (lat: number, lng: number) => void;
};

export const CORES = {
    base: '#f97316',
    baseSemLivre: '#a3a3a3',
    ponto: '#dc2626',
    rua: '#facc15',
    referencia: '#000000',
    emMovimento: '#facc15',
};

export const SALVADOR: [number, number] = [-12.95, -38.46];

/** Ruas que ganham nome fixo no mapa (as mais próximas). */
export const RUAS_ROTULADAS = 4;

export function textoBase(
    nome: string,
    estimativa: Estimativa | null,
): { texto: string; semLivre: boolean } {
    const t = estimativa?.bases.find((b) => b.nome === nome);

    if (!t) {
        return { texto: nome, semLivre: false };
    }

    return {
        texto: `${nome} — ${t.minutos} min · ${t.km} km · ${t.livres.join(', ') || 'sem unidade livre'}`,
        semLivre: t.livres.length === 0,
    };
}
