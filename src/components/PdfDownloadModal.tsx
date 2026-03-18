'use client';

import { useState } from 'react';
import { Book, DisplayMode } from '@/lib/types';
import { getVolumeInfo, generatePdf } from '@/lib/pdf-generator';

interface PdfDownloadModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfDownloadModal({ book, isOpen, onClose }: PdfDownloadModalProps) {
  const [mode, setMode] = useState<DisplayMode>('bilingual');
  const [generating, setGenerating] = useState<string | null>(null);

  if (!isOpen) return null;

  const volumes = getVolumeInfo(book, 10);
  const isSingleVolume = volumes.length <= 1;

  const handleDownload = async (volumeIndex?: number) => {
    const key = volumeIndex !== undefined ? `vol-${volumeIndex}` : 'all';
    setGenerating(key);

    try {
      if (volumeIndex !== undefined) {
        const vol = volumes[volumeIndex];
        await generatePdf(book, vol.chapters, mode, vol.label);
      } else {
        await generatePdf(book, book.chapters, mode);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
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
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
            {/* Language mode selection */}
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)] mb-2 block">
                เลือกภาษาในไฟล์ PDF
              </label>
              <div className="flex gap-2">
                {([
                  { value: 'bilingual' as DisplayMode, label: 'คู่ภาษา (عربي-ไทย)', icon: '🔄' },
                  { value: 'arabic' as DisplayMode, label: 'อาหรับ (عربي)', icon: '🕌' },
                  { value: 'thai' as DisplayMode, label: 'ไทยล้วน', icon: '🇹🇭' },
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
                    <span className="block text-base mb-1">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Download options */}
            <div>
              <label className="text-sm font-medium text-[var(--color-ink)] mb-2 block">
                {isSingleVolume ? 'ดาวน์โหลด' : `เลือกเล่มที่จะดาวน์โหลด (${volumes.length} เล่ม)`}
              </label>

              <div className="space-y-2">
                {/* Download all */}
                <button
                  onClick={() => handleDownload()}
                  disabled={generating !== null}
                  className="w-full flex items-center justify-between rounded-xl border-2 border-[var(--color-teal)] bg-[var(--color-teal)]/5 px-4 py-3 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/10 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>ดาวน์โหลดทั้งหมด ({book.chapters.length} บท)</span>
                  </div>
                  {generating === 'all' ? (
                    <span className="text-xs animate-pulse">กำลังสร้าง PDF...</span>
                  ) : (
                    <span className="text-xs text-[var(--color-ink-light)]">PDF</span>
                  )}
                </button>

                {/* Individual volumes */}
                {!isSingleVolume && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 sidebar-scroll">
                    {volumes.map((vol, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownload(idx)}
                        disabled={generating !== null}
                        className="w-full flex items-center justify-between rounded-lg border border-[var(--color-gold)]/15 bg-white px-4 py-2.5 text-sm text-[var(--color-ink-light)] hover:border-[var(--color-teal)]/30 hover:text-[var(--color-teal)] transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-cream-dark)] text-xs font-bold text-[var(--color-ink-light)]">
                            {vol.number}
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-medium">{vol.label}</span>
                            <span className="block text-[10px] text-[var(--color-ink-light)]/60">
                              สูเราะฮ์ {vol.chapterRange} ({vol.chapters.length} บท)
                            </span>
                          </div>
                        </div>
                        {generating === `vol-${idx}` ? (
                          <span className="text-[10px] animate-pulse text-[var(--color-teal)]">กำลังสร้าง...</span>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-[var(--color-gold)]/10 px-6 py-3 bg-[var(--color-cream)]">
            <p className="text-[10px] text-[var(--color-ink-light)]/60 text-center">
              PDF จะถูกสร้างในเบราว์เซอร์ของคุณ อาจใช้เวลาสักครู่สำหรับไฟล์ขนาดใหญ่
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
