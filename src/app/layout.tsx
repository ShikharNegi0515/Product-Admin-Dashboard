import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Product Admin Dashboard",
    template: "%s | Product Admin",
  },
  description:
    "A premium admin dashboard for managing products. View, search, filter, add, edit and delete products powered by DummyJSON.",
  keywords: ["admin", "dashboard", "products", "e-commerce"],
  authors: [{ name: "Product Admin Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-zinc-950 text-zinc-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
