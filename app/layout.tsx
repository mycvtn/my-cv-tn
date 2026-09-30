import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MY-CV.TN (سيرتي) | Créateur de CV & Lettres de Motivation IA - Tunisie, Europe & Canada",
  description: "Plateforme IA de génération de CV et lettres de motivation optimisés pour le marché tunisien, Europass (Europe) et Canadien (anti-discrimination ATS). Propulsé par Google Gemini.",
  keywords: ["CV Tunisie", "MY-CV.TN", "Lettre de motivation IA", "Europass Tunisie", "CV Canada sans photo", "Flouci", "Konnect", "D17", "Gemini AI"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
