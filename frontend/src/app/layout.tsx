import type { Metadata } from "next";
import { Epilogue, Work_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const epilogue = Epilogue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Samán — Catálogo de Precios",
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
      className={`${epilogue.variable} ${workSans.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
