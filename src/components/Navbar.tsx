'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-gold)]/20 bg-[var(--color-paper)]/95 backdrop-blur-md no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-teal)] text-white transition-colors group-hover:bg-[var(--color-teal-dark)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M8 7h6" />
                <path d="M8 11h4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}>
                ArabicTran
              </span>
              <span className="text-[11px] leading-tight text-[var(--color-ink-light)]">
                ห้องสมุดอิสลาม
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-teal)] transition-colors"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/#library"
              className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-teal)] transition-colors"
            >
              ห้องสมุด
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-teal)] transition-colors"
            >
              เกี่ยวกับ
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="ค้นหาหนังสือ..."
                    className="w-48 sm:w-64 rounded-lg border border-[var(--color-gold)]/30 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)]/30 transition-all"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)] transition-colors"
                  aria-label="ค้นหา"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
              )}
            </div>

            {/* Reading History indicator */}
            <Link
              href="/#reading-history"
              className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              ประวัติการอ่าน
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] transition-colors"
              aria-label="เมนู"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 8h16" />
                    <path d="M4 16h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-gold)]/10 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)]" onClick={() => setMobileMenuOpen(false)}>
              หน้าหลัก
            </Link>
            <Link href="/#library" className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)]" onClick={() => setMobileMenuOpen(false)}>
              ห้องสมุด
            </Link>
            <Link href="/#reading-history" className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)]" onClick={() => setMobileMenuOpen(false)}>
              ประวัติการอ่าน
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
