/** Aviso de que o mesmo nome existe em outros lugares da cidade. */
export function Homonimo({ n }: { n?: number }) {
    if (!n) {
        return null;
    }

    return (
        <span
            title="Existem outros lugares com este mesmo nome em Salvador: confirme o bairro com o solicitante."
            className="ml-1 rounded bg-yellow-300 px-1 text-[9px] font-bold text-black"
        >
            ⚠ mesmo nome em +{n} {n === 1 ? 'lugar' : 'lugares'}
        </span>
    );
}
