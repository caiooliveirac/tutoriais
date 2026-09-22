import { useEffect, useState } from 'react';

export function Relogio() {
    const [agora, setAgora] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setAgora(new Date()), 1000);

        return () => clearInterval(id);
    }, []);

    return (
        <span className="border-l border-neutral-300 pl-3 text-[10px] leading-tight text-neutral-600 tabular-nums">
            {agora.toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}
        </span>
    );
}
