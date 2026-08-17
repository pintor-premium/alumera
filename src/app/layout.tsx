import type { Metadata } from "next";
import { Montserrat, Cinzel } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ALUMERA | Soluções Sob Medida em ACM de Alto Padrão",
  description: "Fachadas residenciais, portas, portões e móveis planejados sob medida em ACM com design sofisticado e requinte moderno.",
  keywords: ["ACM", "Alumera", "fachadas residenciais", "portas de luxo", "portas em ACM", "portões de alto padrão", "arquitetura", "construção de luxo"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#171513]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
