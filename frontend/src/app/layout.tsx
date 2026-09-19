import type { Metadata } from "next";
import { Epilogue, Work_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/AppShell";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

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
  title: "El Saman",
  description: "Consulta rápida de precios en USD y Bolívares para alimentos de mascotas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "El Saman",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#321d0c",
  },
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
      <head>
        <meta name="theme-color" content="#321d0c" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ServiceWorkerRegistrar />
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
