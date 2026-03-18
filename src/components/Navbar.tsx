'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--gold)]/15 bg-[var(--midnight)]/95 backdrop-blur-md no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gold)] text-[var(--midnight)] transition-colors group-hover:bg-[var(--gold-light)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M8 7h6" />
                <path d="M8 11h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-tight text-[var(--gold)]" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
                ArabicTran
              </span>
              <span className="text-[10px] leading-tight text-white/40">
                ห้องสมุดอิสลาม
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-xs font-medium text-white/50 hover:text-[var(--gold)] transition-colors">
              หน้าหลัก
            </Link>
            <Link href="/#library" className="text-xs font-medium text-white/50 hover:text-[var(--gold)] transition-colors">
              ห้องสมุด
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <input
                type="text"
                placeholder="ค้นหาหนังสือ..."
                className="w-48 sm:w-56 rounded-lg border border-[var(--gold)]/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--gold)]/50 transition-all"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-[var(--gold)] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            )}

            <Link href="/#reading-history" className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-white/40 hover:bg-white/10 hover:text-[var(--gold)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" />
              </svg>
              ประวัติ
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
                ) : (
                  <><path d="M4 8h16" /><path d="M4 16h16" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-2 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded text-sm text-white/50 hover:text-[var(--gold)] hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>หน้าหลัก</Link>
            <Link href="/#library" className="block px-3 py-2 rounded text-sm text-white/50 hover:text-[var(--gold)] hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>ห้องสมุด</Link>
            <Link href="/#reading-history" className="block px-3 py-2 rounded text-sm text-white/50 hover:text-[var(--gold)] hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>ประวัติการอ่าน</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
