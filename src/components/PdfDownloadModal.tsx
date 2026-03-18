'use client';

import { useState } from 'react';
import { Book, DisplayMode } from '@/lib/types';

interface PdfDownloadModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfDownloadModal({ book, isOpen, onClose }: PdfDownloadModalProps) {
  const [mode, setMode] = useState<DisplayMode>('bilingual');

  if (!isOpen) return null;

  const perVol = 10;
  const totalVols = Math.ceil(book.chapters.length / perVol);
  const volumes = Array.from({ length: totalVols }, (_, i) => {
    const start = i * perVol;
    const end = Math.min(start + perVol, book.chapters.length);
    const chs = book.chapters.slice(start, end);
    return {
      number: i + 1,
      label: `เล่มที่ ${i + 1}`,
      chapterRange: `สูเราะฮ์ ${chs[0].number} - ${chs[chs.length - 1].number}`,
      chapterNames: `${chs[0].titleTh} — ${chs[chs.length - 1].titleTh}`,
      count: chs.length,
    };
  });

  const openPrint = (vol?: number) => {
    const url = vol !== undefined
      ? `/print/${book.id}?mode=${mode}&vol=${vol}`
      : `/print/${book.id}?mode=${mode}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[var(--color-gold)]/15 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[var(--color-teal)] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <div>
                  <h2 className="text-lg font-semibold">ดาวน์โหลด PDF</h2>
                  <p className="text-xs text-white/70">{book.titleTh}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Language */}
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)] mb-2 block">เลือกภาษา</label>
              <div className="flex gap-2">
                {([
                  { value: 'bilingual' as DisplayMode, label: 'คู่ภาษา', sub: 'عربي + ไทย' },
                  { value: 'arabic' as DisplayMode, label: 'อาหรับ', sub: 'عربي' },
                  { value: 'thai' as DisplayMode, label: 'ไทยล้วน', sub: 'ภาษาไทย' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-xs font-medium transition-all ${
                      mode === opt.value
                        ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)]'
                        : 'border-[var(--color-gold)]/15 text-[var(--color-ink-light)] hover:border-[var(--color-teal)]/30'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-[10px] opacity-60 mt-0.5">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Download options */}
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)] mb-2 block">เลือกเล่ม</label>

              {/* Full book */}
              <button
                onClick={() => openPrint()}
                className="w-full flex items-center justify-between rounded-xl border-2 border-[var(--color-teal)] bg-[var(--color-teal)]/5 px-4 py-3 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/10 transition-colors mb-2"
              >
                <div className="flex items-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                  <span>ทั้งเล่ม ({book.chapters.length} สูเราะฮ์)</span>
                </div>
                <span className="text-xs opacity-60">เปิดหน้าพิมพ์</span>
              </button>

              {/* Volumes */}
              {totalVols > 1 && (
                <div className="max-h-52 overflow-y-auto space-y-1.5 sidebar-scroll">
                  {volumes.map((vol) => (
                    <button
                      key={vol.number}
                      onClick={() => openPrint(vol.number)}
                      className="w-full flex items-center justify-between rounded-lg border border-[var(--color-gold)]/15 bg-white px-4 py-2.5 text-sm text-[var(--color-ink-light)] hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-cream-dark)] text-xs font-bold text-[var(--color-ink-light)]">
                          {vol.number}
                        </div>
                        <div className="text-left">
                          <span className="block text-xs font-medium">{vol.label}</span>
                          <span className="block text-[10px] opacity-60">{vol.chapterRange} ({vol.count} สูเราะฮ์)</span>
                        </div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="rounded-lg bg-[var(--color-cream)] p-3">
              <p className="text-[11px] text-[var(--color-ink-light)] leading-relaxed">
                <strong>วิธีใช้:</strong> กดเลือกเล่มที่ต้องการ → หน้าพิมพ์จะเปิดขึ้นมาใหม่ → กดปุ่ม "พิมพ์ / บันทึก PDF" →
                เลือก "Save as PDF" เป็น Destination → บันทึก
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
