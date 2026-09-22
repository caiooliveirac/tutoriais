import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

export function SamuAbas() {
    const { props, url } = usePage();
    const { areas } = props;
    const abas = [
        { titulo: 'Início', href: dashboard().url },
        ...areas.map((area) => ({ titulo: area.titulo, href: area.href })),
    ];

    return (
        <nav className="flex shrink-0 items-end gap-1 border-b border-neutral-300 bg-white px-6 pt-3">
            {abas.map((aba) => {
                const ativa = url.startsWith(aba.href);

                return (
                    <Link
                        key={aba.href}
                        href={aba.href}
                        className={cn(
                            '-mb-px rounded-t px-5 py-2 text-xs font-bold',
                            ativa
                                ? 'border-x border-t-2 border-x-neutral-300 border-t-orange-500 bg-white text-black'
                                : 'text-neutral-500 hover:text-black',
                        )}
                    >
                        {aba.titulo}
                    </Link>
                );
            })}
        </nav>
    );
}
