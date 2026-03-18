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
    <div className="min-h-screen bg-[var(--ivory)]">
      <Navbar />

      {/* Hero — Ottoman manuscript inspired */}
      <section className="relative overflow-hidden bg-[var(--midnight)]">
        <div className="absolute inset-0 pattern-islamic opacity-40" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--midnight)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            {/* Bismillah */}
            <p
              className="text-lg text-[var(--gold)]/60 mb-6"
              style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>

            <h1
              className="text-4xl sm:text-5xl font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
            >
              ห้องสมุดอิสลาม
            </h1>
            <p
              className="mt-3 text-2xl text-[var(--gold)]"
              style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
              dir="rtl"
            >
              المكتبة الإسلامية
            </p>
            <p className="mt-5 text-sm leading-relaxed text-white/50 max-w-lg font-light">
              อ่านหนังสืออิสลามแปลไทย พร้อมต้นฉบับภาษาอาหรับ
              สามารถเลือกอ่านได้ทั้งแบบอาหรับ คู่ภาษา หรือไทยล้วน
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/#library"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--midnight)] shadow-lg shadow-[var(--gold)]/20 hover:bg-[var(--gold-light)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                เริ่มอ่านเลย
              </Link>
              {recentBooks.length > 0 && (
                <Link
                  href={`/read/${recentBooks[0]}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--gold)]/30 px-6 py-3 text-sm font-medium text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-colors"
                >
                  อ่านต่อจากที่ค้างไว้ →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom ornament */}
        <div className="relative h-8">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[var(--ivory)]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 60%, 0 0)' }} />
        </div>
      </section>

      {/* Continue Reading */}
      {recentBooks.length > 0 && (
        <section id="reading-history" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-[var(--gold)]" />
            <h2 className="text-lg font-semibold text-[var(--ink)]">กำลังอ่านอยู่</h2>
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

      {/* Library */}
      <section id="library" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-[var(--midnight)]" />
          <div>
            <h2 className="text-xl font-semibold text-[var(--ink)]">ห้องสมุด</h2>
            <p className="text-xs text-[var(--ink-faint)] mt-0.5">หนังสืออิสลามแปลไทยทั้งหมด</p>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['ทั้งหมด', 'ตัฟซีร', 'หะดีษ', 'อะกีดะฮ์', 'ฟิกฮ์'].map((cat, i) => (
            <button
              key={cat}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                i === 0
                  ? 'bg-[var(--midnight)] text-white shadow-sm'
                  : 'bg-white border border-[var(--gold)]/15 text-[var(--ink-faint)] hover:border-[var(--gold)]/30 hover:text-[var(--midnight)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBooks.map((book, index) => (
            <BookCard key={book.id} book={book} index={index} />
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-10 rounded-xl border-2 border-dashed border-[var(--gold)]/15 bg-white/50 p-10 text-center">
          <p className="text-sm font-medium text-[var(--ink-faint)]">กำลังเพิ่มหนังสือเล่มใหม่เร็ว ๆ นี้</p>
          <p className="text-xs text-[var(--ink-faint)]/50 mt-1">إن شاء الله</p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[var(--parchment)] border-t border-[var(--gold)]/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-4">เกี่ยวกับ ArabicTran</h2>
            <p className="text-sm text-[var(--ink-light)] leading-relaxed font-light">
              ArabicTran เป็นโครงการแปลหนังสืออิสลามจากภาษาอาหรับเป็นภาษาไทย
              โดยตรวจสอบสำนวนการแปลกับฉบับภาษาอังกฤษ
              สำหรับอายะฮ์อัลกุรอานและหะดีษ เราใช้คำแปลที่เป็นทางการจากแหล่งอ้างอิงที่น่าเชื่อถือ
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--midnight-deep)] text-white/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--gold)]/60">ArabicTran</span>
              <span className="text-[10px]">ห้องสมุดอิสลาม</span>
            </div>
            <p className="text-[10px]">
              คำแปลอัลกุรอานอ้างอิงจาก quran.com | หะดีษอ้างอิงจาก sunnah.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
