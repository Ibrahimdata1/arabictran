import type { Metadata } from "next";
import { Amiri, Noto_Sans_Thai, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArabicTran - ห้องสมุดอิสลาม",
  description: "อ่านหนังสืออิสลามแปลไทย พร้อมต้นฉบับภาษาอาหรับ",
  keywords: ["อิสลาม", "ตัฟซีร", "แปลไทย", "หนังสือศาสนา", "tafsir", "islamic books"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" dir="ltr">
      <body
        className={`${amiri.variable} ${notoThai.variable} ${cormorant.variable} antialiased`}
        style={{ fontFamily: "var(--font-noto-thai), 'Noto Sans Thai', sans-serif" }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
