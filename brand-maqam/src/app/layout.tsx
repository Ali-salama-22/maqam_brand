import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/CartContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import SiteTracker from "@/components/common/SiteTracker";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MAQAM | Urban Premium",
  description: "Luxury Streetwear Legacy. Premium quality clothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        <ThemeProvider>
          <CartProvider>
            <SiteTracker />
            <Navbar />
            <main className="flex-grow flex flex-col w-full pt-20">{children}</main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
