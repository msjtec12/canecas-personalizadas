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
    shortcut: "/favicon.svg",
    apple: "/brand/icon.svg",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Caveat:wght@400..700&family=Cinzel:wght@400..800&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Lobster&family=Montserrat:wght@400;600;700&family=Oswald:wght@400;600;700&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
