import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import LayoutShell from "@/components/LayoutShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = 'BufeteLegal Venezuela';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'BufeteLegal Venezuela — Abogados Expertos en Caracas y todo el país',
        template: '%s | BufeteLegal Venezuela',
    },
    description: 'Bufete de abogados en Venezuela especializado en derecho penal, civil, laboral, familiar y corporativo. Consulta legal online, contratos, representación en tribunales. Más de 500 casos resueltos.',
    keywords: [
        'abogados venezuela', 'bufete legal venezolano', 'abogados caracas',
        'consulta legal venezuela', 'derecho penal venezuela', 'derecho civil venezuela',
        'derecho laboral venezuela', 'abogado LOPNA', 'derecho corporativo venezuela',
        'representacion en juicio', 'abogados online venezuela',
        'bufete de abogados', 'asesoría jurídica', 'INPREABOGADO',
    ],
    authors: [{ name: 'BufeteLegal Venezuela', url: SITE_URL }],
    creator: 'BufeteLegal Venezuela',
    publisher: 'BufeteLegal Venezuela',
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
        type: 'website',
        locale: 'es_VE',
        url: SITE_URL,
        siteName: SITE_NAME,
        title: 'BufeteLegal Venezuela — Abogados Expertos',
        description: 'Conectamos a venezolanos con abogados verificados. Consultas online, seguimiento de expedientes, firma digital de contratos.',
        images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'BufeteLegal Venezuela' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BufeteLegal Venezuela — Abogados Expertos',
        description: 'Conectamos venezolanos con abogados verificados.',
        images: ['/og-image.jpg'],
    },
    alternates: { canonical: SITE_URL },
    category: 'legal services',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0C2340',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" dir="ltr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="http://localhost:4000" />
            </head>
            <body>
                <AuthProvider>
                    <SocketProvider>
                        <LayoutShell>{children}</LayoutShell>
                    </SocketProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
