import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";

import { AppProviders } from "@/app/providers";

import "./globals.css";

const displayFont = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Meu Din Din",
  description: "Controle financeiro pessoal com projeção de saldo e extrato.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body style={{ display: "flex", minHeight: "100%", flexDirection: "column" }}>
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
