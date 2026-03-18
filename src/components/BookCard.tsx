'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getReadingPercentage, getProgress } from '@/lib/reading-progress';

interface BookCardProps {
  book: Book;
  index: number;
}

function ProgressRing({ percentage, size = 34 }: { percentage: number; size?: number }) {
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gold-pale)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gold)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export default function BookCard({ book, index }: BookCardProps) {
  const [progress, setProgress] = useState(0);
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const p = getReadingPercentage(book.id, book.totalChapters);
    setProgress(p);
    setHasProgress(!!getProgress(book.id));
  }, [book.id, book.totalChapters]);

  return (
    <Link href={`/read/${book.id}`} className="block">
      <div className={`book-card group relative overflow-hidden rounded-xl bg-white shadow-sm border border-[var(--gold)]/10 opacity-0 animate-fade-in-up animate-stagger-${Math.min(index + 1, 6)}`}>
        {/* Cover */}
        <div className="relative h-52 overflow-hidden bg-[var(--midnight)]">
          <div className="absolute inset-0 pattern-islamic opacity-30" />
          {/* Gold frame */}
          <div className="absolute inset-3 border border-[var(--gold)]/25 rounded" />
          <div className="absolute inset-4 border border-[var(--gold)]/10 rounded-sm" />

          <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
            <p className="text-xl font-bold text-[var(--gold)] leading-relaxed mb-2 drop-shadow-sm" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }} dir="rtl">
              {book.titleAr}
            </p>
            <div className="w-12 h-px bg-[var(--gold)]/40 my-1.5" />
            <p className="text-[10px] text-[var(--gold)]/50" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }} dir="rtl">
              {book.authorAr}
            </p>
          </div>

          {hasProgress && (
            <div className="absolute top-3 left-3">
              <div className="relative flex items-center justify-center">
                <ProgressRing percentage={progress} />
                <span className="absolute text-[8px] font-bold text-[var(--gold)]">{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-1 group-hover:text-[var(--midnight)] transition-colors">
            {book.titleTh}
          </h3>
          <p className="text-xs text-[var(--ink-faint)] mb-2">{book.authorTh}</p>
          <p className="text-[11px] text-[var(--ink-faint)]/70 line-clamp-2 leading-relaxed font-light">
            {book.description}
          </p>

          <div className="mt-3 pt-3 border-t border-[var(--gold)]/10 flex items-center justify-between">
            <span className="text-[10px] text-[var(--ink-faint)]">{book.totalChapters} สูเราะฮ์</span>
            <div className="flex items-center gap-2">
              {book.hasPdf && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--gold-pale)] text-[var(--gold-dim)]">PDF</span>
              )}
              <span className="text-[11px] font-medium text-[var(--midnight)]">
                {hasProgress ? 'อ่านต่อ →' : 'เริ่มอ่าน →'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
