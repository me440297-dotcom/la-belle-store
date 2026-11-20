import type { Metadata } from "next";
import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";
import CartDrawer from "./components/CartDrawer";
import SplashScreen from "./components/SplashScreen";
import AdminFloatingButton from "./components/AdminFloatingButton";
import Providers from "./components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: 'swap' });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-script", display: 'swap' });

export const metadata: Metadata = {
  title: "La Béllé | Women's Fashion Boutique",
  description: "Elegant fashion for every occasion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${greatVibes.variable} font-sans antialiased`}>
        <Providers>
          <SplashScreen />
          {children}
          <CartDrawer />
          <AdminFloatingButton />
        </Providers>
      </body>
    </html>
  );
}