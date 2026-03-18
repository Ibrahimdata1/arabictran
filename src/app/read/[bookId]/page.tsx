'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LanguageToggle from '@/components/LanguageToggle';
import TableOfContents from '@/components/TableOfContents';
import ContentSection from '@/components/ContentSection';
import { allBooks } from '@/data/tafsir-sadi';
import { DisplayMode } from '@/lib/types';
import { getProgress, saveProgress, migrateProgress } from '@/lib/reading-progress';
import PdfDownloadModal from '@/components/PdfDownloadModal';
import { useSession } from 'next-auth/react';

export default function ReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = allBooks.find((b) => b.id === bookId);
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [mode, setMode] = useState<DisplayMode>('bilingual');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Migrate anonymous progress on login
  useEffect(() => {
    if (userEmail) migrateProgress(userEmail);
  }, [userEmail]);

  // Load saved progress
  useEffect(() => {
    setMounted(true);
    if (!book) return;

    const progress = getProgress(bookId, userEmail);
    if (progress) {
      const chapterIdx = book.chapters.findIndex((ch) => ch.id === progress.chapterId);
      if (chapterIdx >= 0) {
        setCurrentChapterIndex(chapterIdx);
        setActiveChapterId(progress.chapterId);
        setActiveSectionId(progress.sectionId);
      }
    } else {
      setActiveChapterId(book.chapters[0]?.id || null);
    }
  }, [book, bookId, userEmail]);

  // Save progress on scroll (debounced)
  const handleScroll = useCallback(() => {
    if (!book || !contentRef.current) return;

    const chapter = book.chapters[currentChapterIndex];
    if (!chapter) return;

    const sections = contentRef.current.querySelectorAll('[id^="sec-"]');
    let lastVisible = chapter.sections[0]?.id || '';

    sections.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        lastVisible = el.id;
      }
    });

    saveProgress({
      bookId,
      chapterId: chapter.id,
      sectionId: lastVisible,
      scrollPosition: window.scrollY,
      lastRead: Date.now(),
    }, userEmail);
    setActiveSectionId(lastVisible);
  }, [book, bookId, currentChapterIndex]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 130; // toolbar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSectionId(sectionId);
    }
  };

  // Navigate to chapter - INSTANT scroll to top like Shamela
  const goToChapter = useCallback((chapterId: string) => {
    if (!book) return;
    const idx = book.chapters.findIndex((ch) => ch.id === chapterId);
    if (idx >= 0) {
      setCurrentChapterIndex(idx);
      setActiveChapterId(chapterId);
      setSidebarOpen(false);
      // Instant scroll to top - no smooth, immediate like Shamela
      window.scrollTo(0, 0);
    }
  }, [book]);

  const goToChapterSection = useCallback((chapterId: string, sectionId: string) => {
    if (!book) return;
    const idx = book.chapters.findIndex((ch) => ch.id === chapterId);
    if (idx >= 0) {
      setCurrentChapterIndex(idx);
      setActiveChapterId(chapterId);
      setSidebarOpen(false);
      // Wait for render then scroll to section
      setTimeout(() => scrollToSection(sectionId), 50);
    }
  }, [book]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!book) return;
      if (e.key === 'ArrowRight' && currentChapterIndex < book.chapters.length - 1) {
        goToChapter(book.chapters[currentChapterIndex + 1].id);
      } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
        goToChapter(book.chapters[currentChapterIndex - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, currentChapterIndex, goToChapter]);

  if (!book) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[var(--color-ink-light)]">ไม่พบหนังสือ</p>
          <Link href="/" className="mt-4 inline-block text-[var(--color-teal)] hover:underline">
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  const currentChapter = book.chapters[currentChapterIndex];
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < book.chapters.length - 1;
  const prevChapter = hasPrev ? book.chapters[currentChapterIndex - 1] : null;
  const nextChapter = hasNext ? book.chapters[currentChapterIndex + 1] : null;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      {/* Reader toolbar */}
      <div className="sticky top-16 z-30 border-b border-[var(--color-gold)]/15 bg-[var(--color-paper)]/95 backdrop-blur-md no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Left: back + quick prev/next */}
            <div className="flex items-center gap-1 min-w-0">
              <Link
                href="/"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] transition-colors"
                title="กลับหน้าหลัก"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>

              {/* Quick chapter nav in toolbar */}
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <button
                  onClick={() => hasPrev && goToChapter(prevChapter!.id)}
                  disabled={!hasPrev}
                  className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title={prevChapter ? `บทก่อนหน้า: ${prevChapter.titleTh}` : ''}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="text-[11px] text-[var(--color-ink-light)] tabular-nums px-1">
                  {currentChapterIndex + 1}/{book.chapters.length}
                </span>
                <button
                  onClick={() => hasNext && goToChapter(nextChapter!.id)}
                  disabled={!hasNext}
                  className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title={nextChapter ? `บทถัดไป: ${nextChapter.titleTh}` : ''}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>

              <div className="min-w-0 ml-2">
                <h1 className="truncate text-sm font-semibold text-[var(--color-ink)]">
                  {currentChapter?.titleTh}
                </h1>
                <p className="truncate text-[11px] text-[var(--color-ink-light)]" dir="rtl" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
                  {currentChapter?.titleAr}
                </p>
              </div>
            </div>

            {/* Center: language toggle */}
            <div className="hidden md:block">
              <LanguageToggle mode={mode} onChange={setMode} />
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {/* Mobile language toggle */}
              <div className="md:hidden">
                <LanguageToggle mode={mode} onChange={setMode} />
              </div>

              {/* PDF download */}
              {book.hasPdf && (
                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] hover:text-[var(--color-teal)] transition-colors"
                  title="ดาวน์โหลด PDF"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  PDF
                </button>
              )}

              {/* TOC toggle for mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-light)] hover:bg-[var(--color-cream-dark)] transition-colors"
                title="สารบัญ"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="15" y2="12" />
                  <line x1="3" y1="18" x2="9" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="mx-auto max-w-7xl lg:flex">
        {/* Content */}
        <main className="flex-1 min-w-0">
          <div ref={contentRef} className="reading-content px-4 py-8 sm:px-6 lg:px-8">
            {/* Chapter header */}
            <div className="text-center mb-10">
              <p
                className="text-3xl font-bold text-[var(--color-ink)] mb-2"
                style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
                dir="rtl"
              >
                {currentChapter?.titleAr}
              </p>
              <div className="divider-gold my-4 max-w-32 mx-auto" />
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">
                {currentChapter?.titleTh}
              </h2>
            </div>

            {/* Sections */}
            {currentChapter?.sections.map((section) => (
              <ContentSection key={section.id} section={section} mode={mode} />
            ))}

            {/* Chapter navigation - large buttons like Shamela */}
            <div className="mt-12 pt-8 border-t border-[var(--color-gold)]/15">
              <div className="grid grid-cols-2 gap-3">
                {/* Previous */}
                <button
                  onClick={() => hasPrev && goToChapter(prevChapter!.id)}
                  disabled={!hasPrev}
                  className={`flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-all ${
                    hasPrev
                      ? 'bg-white border border-[var(--color-gold)]/15 hover:border-[var(--color-teal)]/30 hover:shadow-sm cursor-pointer'
                      : 'opacity-30 cursor-not-allowed bg-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs text-[var(--color-ink-light)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                    บทก่อนหน้า
                  </span>
                  {prevChapter && (
                    <span className="text-sm font-medium text-[var(--color-teal)] line-clamp-1">
                      {prevChapter.titleTh}
                    </span>
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={() => hasNext && goToChapter(nextChapter!.id)}
                  disabled={!hasNext}
                  className={`flex flex-col items-end gap-1 rounded-xl px-4 py-3 text-right transition-all ${
                    hasNext
                      ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] shadow-sm cursor-pointer'
                      : 'opacity-30 cursor-not-allowed bg-transparent'
                  }`}
                >
                  <span className="flex items-center gap-1 text-xs opacity-80">
                    บทถัดไป
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                  </span>
                  {nextChapter && (
                    <span className="text-sm font-medium line-clamp-1">
                      {nextChapter.titleTh}
                    </span>
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-[var(--color-ink-light)]/50 mt-4">
                {currentChapterIndex + 1} / {book.chapters.length} บท • ใช้ปุ่มลูกศร ← → เพื่อเปลี่ยนบท
              </p>
            </div>
          </div>
        </main>

        {/* Table of Contents Sidebar */}
        <TableOfContents
          chapters={book.chapters}
          activeChapterId={activeChapterId}
          activeSectionId={activeSectionId}
          onSelectChapter={goToChapter}
          onSelectSection={goToChapterSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* PDF Download Modal */}
      <PdfDownloadModal
        book={book}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
}
