import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog Jurídico — Artículos Legales para Venezuela',
    description: 'Artículos, análisis y guías legales escritas por abogados especializados. Derecho penal, civil, laboral, LOPNA y corporativo en Venezuela.',
    keywords: ['blog juridico venezuela', 'articulos legales venezuela', 'derecho venezolano', 'leyes venezuela', 'COPP', 'Código Civil Venezuela', 'LOPNA'],
    openGraph: {
        title: 'Blog Jurídico | BufeteLegal Venezuela',
        description: 'Artículos legales escritos por abogados venezolanos especializados.',
        type: 'website',
    },
    alternates: { canonical: '/blog' },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
