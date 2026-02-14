import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Douzième Homme",
  description: "Quiz du jeu de plateau Douzième Homme",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const fondAccueilUrl = process.env.NEXT_PUBLIC_FOND_ACCUEIL_URL || "/fond-accueil.png";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --fond-accueil-url: url('${fondAccueilUrl.replace(/'/g, "\\'")}'); }`,
          }}
        />
      </head>
      <body className="antialiased bg-slate-900 text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
