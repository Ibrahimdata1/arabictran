'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';
import { allBooks } from '@/data/tafsir-sadi';
import { getAllProgress } from '@/lib/reading-progress';
import Link from 'next/link';

export default function Home() {
  const [recentBooks, setRecentBooks] = useState<string[]>([]);

  useEffect(() => {
    const progress = getAllProgress();
    const recent = Object.entries(progress)
      .sort(([, a], [, b]) => b.lastRead - a.lastRead)
      .map(([bookId]) => bookId);
    setRecentBooks(recent);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--color-teal)] text-white">
        <div className="absolute inset-0 pattern-islamic opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold leading-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
            >
              ห้องสมุดอิสลาม
            </h1>
            <p
              className="mt-2 text-2xl text-white/70"
              style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
              dir="rtl"
            >
              المكتبة الإسلامية
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80 max-w-lg">
              อ่านหนังสืออิสลามแปลไทย พร้อมต้นฉบับภาษาอาหรับ
              สามารถเลือกอ่านได้ทั้งแบบอาหรับ คู่ภาษา หรือไทยล้วน
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#library"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[var(--color-teal)] shadow-lg shadow-black/10 hover:bg-white/95 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                เริ่มอ่านเลย
              </Link>
              {recentBooks.length > 0 && (
                <Link
                  href={`/read/${recentBooks[0]}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  อ่านต่อจากที่ค้างไว้
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 48h1440V24c-240 16-480 24-720 24S240 40 0 24v24z" fill="var(--color-cream)" />
          </svg>
        </div>
      </section>

      {/* Continue Reading Section */}
      {recentBooks.length > 0 && (
        <section id="reading-history" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-[var(--color-gold)]" />
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">กำลังอ่านอยู่</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentBooks.map((bookId) => {
              const book = allBooks.find((b) => b.id === bookId);
              if (!book) return null;
              return <BookCard key={book.id} book={book} index={0} />;
            })}
          </div>
        </section>
      )}

      {/* Library Section */}
      <section id="library" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-[var(--color-teal)]" />
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">ห้องสมุด</h2>
            <p className="text-sm text-[var(--color-ink-light)] mt-0.5">หนังสืออิสลามแปลไทยทั้งหมด</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button className="rounded-lg bg-[var(--color-teal)] px-4 py-2 text-sm font-medium text-white shadow-sm">
            ทั้งหมด
          </button>
          <button className="rounded-lg bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] border border-[var(--color-gold)]/15 hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors">
            ตัฟซีร
          </button>
          <button className="rounded-lg bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] border border-[var(--color-gold)]/15 hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors">
            หะดีษ
          </button>
          <button className="rounded-lg bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] border border-[var(--color-gold)]/15 hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors">
            อะกีดะฮ์
          </button>
          <button className="rounded-lg bg-[var(--color-paper)] px-4 py-2 text-sm font-medium text-[var(--color-ink-light)] border border-[var(--color-gold)]/15 hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors">
            ฟิกฮ์
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>

        {/* Coming soon placeholder */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[var(--color-gold)]/20 bg-[var(--color-paper)]/50 p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-gold-pale)] flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-ink-light)]">
            กำลังเพิ่มหนังสือเล่มใหม่เร็ว ๆ นี้
          </p>
          <p className="text-xs text-[var(--color-ink-light)]/60 mt-1">
            อินชาอัลลอฮ์
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[var(--color-paper)] border-t border-[var(--color-gold)]/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)] mb-4">เกี่ยวกับ ArabicTran</h2>
            <p className="text-[var(--color-ink-light)] leading-relaxed">
              ArabicTran เป็นโครงการแปลหนังสืออิสลามจากภาษาอาหรับเป็นภาษาไทย
              โดยตรวจสอบสำนวนการแปลกับฉบับภาษาอังกฤษ
              เพื่อให้ได้คำแปลที่ถูกต้องและสละสลวยที่สุด
              สำหรับอายะฮ์อัลกุรอานและหะดีษ เราใช้คำแปลที่เป็นทางการจากแหล่งอ้างอิงที่น่าเชื่อถือ
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-ink)] text-white/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/80">ArabicTran</span>
              <span className="text-xs">ห้องสมุดอิสลาม</span>
            </div>
            <p className="text-xs">
              คำแปลอัลกุรอานอ้างอิงจาก quran.com | หะดีษอ้างอิงจาก sunnah.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
