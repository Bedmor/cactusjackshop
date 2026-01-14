import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Oxygen, Oswald } from "next/font/google"; // Import Oxygen and Oswald

export const metadata: Metadata = {
  title: "Cactus Jack - En Trend Ürünler ve Alışveriş",
  description: "Cactus Jack ile en yeni trendleri keşfedin. Özel tasarım ürünler, giyim, aksesuar ve daha fazlası uygun fiyatlarla burada.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const oxygen = Oxygen({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-oxygen",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geist.variable} ${oxygen.variable} ${oswald.variable}`}>
      <body>{children}</body>
    </html>
  );
}
