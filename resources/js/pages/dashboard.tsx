import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth, areas } = usePage().props;

    return (
        <>
            <Head title="Início" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <h1 className="text-xl font-semibold">
                        Olá, {auth.user.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Perfis: {auth.perfis.join(', ') || 'nenhum'}
                    </p>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {areas.map((area) => (
                        <Link
                            key={area.slug}
                            href={area.href}
                            className="rounded-xl border border-sidebar-border/70 p-6 font-medium hover:bg-accent dark:border-sidebar-border"
                        >
                            {area.titulo}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Início',
            href: dashboard(),
        },
    ],
};
