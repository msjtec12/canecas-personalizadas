import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Montuá | Presentes personalizados do seu jeito",
  description:
    "Crie presentes personalizados com fotos, nomes, frases e artes. Monte do seu jeito, visualize como ficará e faça seu pedido pela Montuá.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Montuá | Presentes personalizados do seu jeito",
    description:
      "Crie presentes personalizados com fotos, nomes, frases e artes. Monte do seu jeito, visualize como ficará e faça seu pedido pela Montuá.",
    siteName: "Montuá Presentes",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
