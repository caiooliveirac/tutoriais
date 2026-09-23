import { useEffect, useState } from 'react';
import { buscarJson } from '@/lib/buscar-json';
import { bairros } from '@/routes/atendimento';
import { campo } from './estilos';

type Props = {
    valor: string;
    erro?: string;
    onMudar: (bairro: string) => void;
};

/** Bairro digitado de ouvido → "Quis dizer: Tororó?" (casamento por som). */
export function CampoBairro({ valor, erro, onMudar }: Props) {
    const [parecidos, setParecidos] = useState<string[]>([]);

    useEffect(() => {
        const texto = valor.trim();

        if (texto.length < 3) {
            setParecidos([]);

            return;
        }

        const espera = setTimeout(() => {
            buscarJson<{ nome: string }[]>(bairros.url({ query: { q: texto } }))
                .then((r) =>
                    setParecidos(
                        r.map((b) => b.nome).filter((n) => n !== texto),
                    ),
                )
                .catch(() => setParecidos([]));
        }, 400);

        return () => clearTimeout(espera);
    }, [valor]);

    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-black">
                Bairro
            </span>
            <input
                className={campo}
                value={valor}
                onChange={(e) => onMudar(e.target.value)}
            />
            {parecidos.length > 0 && (
                <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-neutral-700">
                    Quis dizer:
                    {parecidos.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onMudar(p)}
                            className="rounded bg-yellow-300 px-1.5 font-bold text-black hover:bg-yellow-400"
                        >
                            {p}
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
