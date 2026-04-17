'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CryptoTicker from '@/components/CryptoTicker';
import Footer from '@/components/Footer';
import AIChatWidget from '@/components/AIChatWidget';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');

    return (
        <>
            {!isDashboard && <CryptoTicker />}
            {!isDashboard && <Navbar />}
            <main className="main-wrapper">{children}</main>
            {!isDashboard && <Footer />}
            <AIChatWidget />
        </>
    );
}
