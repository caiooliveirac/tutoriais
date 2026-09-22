import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { Relogio } from '@/components/samu/relogio';
import { SamuLogo } from '@/components/samu/samu-logo';
import { dashboard, logout } from '@/routes';
import { edit } from '@/routes/profile';

export function SamuHeader() {
    const { auth } = usePage().props;

    return (
        <header className="relative z-20 flex h-[60px] shrink-0 items-center justify-between border-b-2 border-orange-500 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-3">
                <Link href={dashboard()}>
                    <SamuLogo />
                </Link>
                <Relogio />
            </div>

            <div className="flex items-center gap-3">
                <span className="hidden text-xs font-bold tracking-wide text-neutral-600 uppercase md:inline">
                    Bem-vindo:{' '}
                    <span className="text-black">{auth.user.name}</span>
                </span>

                <Link
                    href={edit()}
                    title="Configurações"
                    className="flex size-8 items-center justify-center rounded border border-b-4 border-yellow-500 bg-yellow-400 text-black shadow-sm transition-all hover:bg-yellow-300 active:translate-y-0.5 active:border-b"
                >
                    <Settings size={15} />
                </Link>

                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    title="Sair do sistema"
                    className="flex size-8 items-center justify-center rounded border border-b-4 border-neutral-400 bg-neutral-200 text-black shadow-sm transition-all hover:bg-neutral-300 active:translate-y-0.5 active:border-b"
                >
                    <LogOut size={15} />
                </Link>
            </div>
        </header>
    );
}
