import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
    title: "BufeteLegal - Firma de Abogados",
    description: "Soluciones jurídicas con excelencia profesional. Consultas legales, representación en juicio, redacción de contratos y asesoría empresarial.",
    keywords: "abogados, bufete, legal, consulta, derecho, Venezuela",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
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
