import LandingPagePembeli from "@/components/pembeli/pages/LandingPagePembeli";
import type { Metadata } from 'next';

// 'metadata' sekarang berada di Server Component, ini sudah benar.
export const metadata: Metadata = {
  title: 'Selamat Datang', // Ini akan mengisi placeholder %s
};

export default function Home() {
  return (
    <LandingPagePembeli />
  );
}