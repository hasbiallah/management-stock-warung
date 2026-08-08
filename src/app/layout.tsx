import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Manajemen Stok Warung",
  description: "Pencatatan stok sederhana untuk warung.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
