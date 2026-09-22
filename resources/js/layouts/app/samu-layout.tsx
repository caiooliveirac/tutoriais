import { SamuAbas } from '@/components/samu/samu-abas';
import { SamuHeader } from '@/components/samu/samu-header';

export default function SamuLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-black">
            <SamuHeader />
            <SamuAbas />
            <main className="flex-1 space-y-6 overflow-auto p-4">
                {children}
            </main>
        </div>
    );
}
