import SamuLayout from '@/layouts/app/samu-layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <SamuLayout>{children}</SamuLayout>;
}
