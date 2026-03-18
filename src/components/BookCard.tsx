'use client';

import Link from 'next/link';
import { Book } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getReadingPercentage, getProgress } from '@/lib/reading-progress';

interface BookCardProps {
  book: Book;
  index: number;
}

function ProgressRing({ percentage, size = 36 }: { percentage: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-gold-pale)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
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
      <div
        className={`book-card group relative overflow-hidden rounded-xl bg-white shadow-sm border border-[var(--color-gold)]/10 opacity-0 animate-fade-in-up animate-stagger-${Math.min(index + 1, 6)}`}
      >
        {/* Book cover area */}
        <div
          className="relative h-52 overflow-hidden"
          style={{ backgroundColor: book.coverColor }}
        >
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 pattern-islamic opacity-30" />

          {/* Decorative border frame */}
          <div className="absolute inset-3 border border-white/20 rounded-lg" />
          <div className="absolute inset-4 border border-white/10 rounded-md" />

          {/* Book title on cover */}
          <div className="relative flex flex-col items-center justify-center h-full px-6 text-center">
            <p
              className="text-2xl font-bold text-white/95 leading-relaxed mb-2 drop-shadow-sm"
              style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
              dir="rtl"
            >
              {book.titleAr}
            </p>
            <div className="w-16 h-px bg-white/40 my-1" />
            <p
              className="text-xs text-white/70 mt-1"
              style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
              dir="rtl"
            >
              {book.authorAr}
            </p>
          </div>

          {/* Progress indicator */}
          {hasProgress && (
            <div className="absolute top-3 left-3">
              <div className="relative flex items-center justify-center">
                <ProgressRing percentage={progress} />
                <span className="absolute text-[9px] font-bold text-white">
                  {progress}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-teal)] transition-colors">
            {book.titleTh}
          </h3>
          <p className="text-sm text-[var(--color-ink-light)] mb-3">
            {book.authorTh}
          </p>
          <p className="text-xs text-[var(--color-ink-light)]/70 line-clamp-2 leading-relaxed">
            {book.description}
          </p>

          {/* Bottom bar */}
          <div className="mt-3 pt-3 border-t border-[var(--color-gold)]/10 flex items-center justify-between">
            <span className="text-xs text-[var(--color-ink-light)]">
              {book.totalChapters} บท
            </span>
            <div className="flex items-center gap-2">
              {book.hasPdf && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-gold-pale)] text-[var(--color-ink-light)]">
                  PDF
                </span>
              )}
              {hasProgress ? (
                <span className="text-xs font-medium text-[var(--color-teal)] flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  อ่านต่อ
                </span>
              ) : (
                <span className="text-xs font-medium text-[var(--color-teal)]">
                  เริ่มอ่าน →
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
