'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Book, DisplayMode } from '@/lib/types';
import { getVolumeInfo, generateAndDownloadPdf } from '@/lib/pdf-generator';

interface PdfDownloadModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfDownloadModal({ book, isOpen, onClose }: PdfDownloadModalProps) {
  const [mode, setMode] = useState<DisplayMode>('bilingual');
  const [generating, setGenerating] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef(false);

  const handleCancel = useCallback(() => {
    if (generating) { abortRef.current = true; setGenerating(null); setProgress(0); }
    else { onClose(); }
  }, [generating, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;
  const volumes = getVolumeInfo(book, 10);

  const handleDownload = async (volumeIndex?: number) => {
    const key = volumeIndex !== undefined ? `vol-${volumeIndex}` : 'all';
    abortRef.current = false;
    setGenerating(key);
    setProgress(0);
    try {
      const onProg = (pct: number) => { if (abortRef.current) throw new Error('cancelled'); setProgress(pct); };
      if (volumeIndex !== undefined) {
        const vol = volumes[volumeIndex];
        await generateAndDownloadPdf(book, vol.chapters, mode, vol.label, onProg);
      } else {
        await generateAndDownloadPdf(book, book.chapters, mode, undefined, onProg);
      }
    } catch (err) {
      if ((err as Error).message !== 'cancelled') { console.error(err); alert('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    } finally { abortRef.current = false; setGenerating(null); setProgress(0); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={handleCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[var(--color-gold)]/15 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-[var(--color-teal)] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                <div><h2 className="text-base font-semibold">ดาวน์โหลด PDF</h2><p className="text-[11px] text-white/70">{book.titleTh}</p></div>
              </div>
              <button onClick={handleCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors" title="ปิด (Esc)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Progress */}
          {generating && (
            <div className="px-6 py-5 bg-[var(--color-cream)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-spin h-4 w-4 border-2 border-[var(--color-teal)] border-t-transparent rounded-full" />
                <span className="text-sm font-medium text-[var(--color-teal)]">กำลังสร้าง PDF... {progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--color-cream-dark)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-[var(--color-ink-light)] mt-3 text-center">กด Esc เพื่อยกเลิก</p>
            </div>
          )}

          {/* Content */}
          {!generating && (
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-ink)] mb-2 block">เลือกภาษาใน PDF</label>
                <div className="flex gap-2">
                  {([
                    { value: 'bilingual' as DisplayMode, label: 'คู่ภาษา', sub: 'عربي + ไทย' },
                    { value: 'arabic' as DisplayMode, label: 'อาหรับ', sub: 'عربي فقط' },
                    { value: 'thai' as DisplayMode, label: 'แปลไทย', sub: 'ตัฟซีรไทยล้วน' },
                  ]).map((opt) => (
                    <button key={opt.value} onClick={() => setMode(opt.value)}
                      className={`flex-1 rounded-xl border-2 px-3 py-2 text-center transition-all ${mode === opt.value ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5 text-[var(--color-teal)]' : 'border-[var(--color-gold)]/15 text-[var(--color-ink-light)] hover:border-[var(--color-teal)]/30'}`}>
                      <span className="block text-sm font-semibold">{opt.label}</span>
                      <span className="block text-[10px] opacity-60">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-ink)] mb-2 block">กดเพื่อดาวน์โหลด</label>
                <button onClick={() => handleDownload()} className="w-full flex items-center justify-between rounded-xl border-2 border-[var(--color-teal)] bg-[var(--color-teal)]/5 px-4 py-3 text-sm font-medium text-[var(--color-teal)] hover:bg-[var(--color-teal)]/10 transition-colors mb-3">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    <span>ทั้งเล่ม ({book.chapters.length} สูเราะฮ์)</span>
                  </div>
                  <span className="text-[10px] bg-[var(--color-teal)]/10 px-2 py-0.5 rounded-full">.pdf</span>
                </button>
                {volumes.length > 1 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 sidebar-scroll">
                    {volumes.map((vol, idx) => (
                      <button key={idx} onClick={() => handleDownload(idx)} className="w-full flex items-center justify-between rounded-lg border border-[var(--color-gold)]/15 bg-white px-3 py-2.5 text-left hover:border-[var(--color-teal)]/30 hover:bg-[var(--color-teal)]/3 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-cream-dark)] text-xs font-bold text-[var(--color-ink-light)] group-hover:bg-[var(--color-teal)]/10 group-hover:text-[var(--color-teal)]">{vol.number}</div>
                          <div>
                            <span className="block text-xs font-medium text-[var(--color-ink)] group-hover:text-[var(--color-teal)]">{vol.label} ({vol.chapters.length} สูเราะฮ์)</span>
                            <span className="block text-[10px] text-[var(--color-ink-light)]/60 leading-snug">{vol.names}</span>
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-light)]/30 group-hover:text-[var(--color-teal)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
