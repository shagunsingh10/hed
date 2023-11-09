"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import AppLayout from "./layout";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herald",
  description: "Knowledge management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppLayout children={children} />
        </Providers>
      </body>
    </html>
  );
}
