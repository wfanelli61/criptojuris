import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Directorio de Abogados en Venezuela',
    description: 'Encuentra al abogado ideal en Venezuela. Filtros por especialidad (penal, civil, LOPNA, corporativo), ciudad, experiencia e idioma. Todos nuestros abogados están verificados.',
    keywords: ['directorio abogados venezuela', 'buscar abogado venezuela', 'abogados caracas', 'abogado penal venezuela', 'abogado civil venezuela', 'abogado laboral'],
    openGraph: {
        title: 'Directorio de Abogados en Venezuela | BufeteLegal',
        description: 'Encuentra y contrata abogados verificados en Venezuela. Filtros avanzados por especialidad, ciudad y tarifa.',
        type: 'website',
    },
    alternates: { canonical: '/abogados' },
};

export default function AbogadosLayout({ children }: { children: React.ReactNode }) {
    return children;
}
