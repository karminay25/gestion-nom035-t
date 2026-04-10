import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión NOM-035 | Sistema de Cumplimiento",
  description: "Plataforma premium para la identificación y análisis de factores de riesgo psicosocial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-[#050505] text-white`}>
        {children}
      </body>
    </html>
  );
}
