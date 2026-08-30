import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import "./hero-polish.css";
import { brand } from "@/lib/brand";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: `${brand.name} | ${brand.tagline}`,
  description:
    "Property-specific project feasibility for garages, decks, sheds, pools and additions. Check zoning, setbacks, constraints, permits and source evidence before you spend.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  );
}
