import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pet-Price Venezuela",
  description: "Precios de alimentos para mascotas con tasa oficial BCV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} font-sans antialiased bg-stone-50 text-stone-900`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
