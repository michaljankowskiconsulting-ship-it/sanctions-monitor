import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitor Listy Sankcyjnej MSWiA",
  description:
    "Automatyczne śledzenie zmian na liście osób i podmiotów objętych sankcjami - MSWiA Gov.pl",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
