import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth, areas } = usePage().props;

    return (
        <>
            <Head title="Início" />
            <div>
                <h1 className="text-lg font-bold text-black">
                    Olá, {auth.user.name}
                </h1>
                <p className="text-xs text-neutral-600">
                    Perfis: {auth.perfis.join(', ') || 'nenhum'}
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {areas.map((area) => (
                    <Link
                        key={area.slug}
                        href={area.href}
                        className="rounded border border-b-4 border-neutral-200 border-b-orange-500 bg-white p-5 text-sm font-bold text-black uppercase shadow-sm transition-all hover:border-b-yellow-400"
                    >
                        {area.titulo}
                    </Link>
                ))}
            </div>
        </>
    );
}
