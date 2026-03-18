'use client';

import { Section, DisplayMode } from '@/lib/types';

interface ContentSectionProps {
  section: Section;
  mode: DisplayMode;
}

export default function ContentSection({ section, mode }: ContentSectionProps) {
  const showArabic = mode === 'arabic' || mode === 'bilingual';
  const showThai = mode === 'thai' || mode === 'bilingual';

  if (section.type === 'quran') {
    return (
      <div className="quran-verse my-8" id={section.id}>
        {section.reference && (
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--verse-border)]/20">
            <span className="text-xs font-semibold text-[var(--verse-border)] tracking-wide uppercase">
              {section.reference}
            </span>
          </div>
        )}
        {showArabic && (
          <p
            className="arabic-text text-[22px] leading-[2.6] text-[var(--ink)] mb-4 font-bold"
            style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
          >
            {section.contentAr}
          </p>
        )}
        {showThai && (
          <p className="thai-text text-[14px] leading-[2.1] text-[var(--ink-light)]">
            {section.contentTh}
          </p>
        )}
      </div>
    );
  }

  if (section.type === 'hadith') {
    return (
      <div className="hadith-block my-6" id={section.id}>
        {section.reference && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--hadith-border)]/20">
            <span className="text-xs font-semibold text-[var(--gold-dim)] tracking-wide">
              {section.reference}
            </span>
          </div>
        )}
        {showArabic && (
          <p
            className="arabic-text text-lg leading-[2.3] text-[var(--ink)] mb-3"
            style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
          >
            {section.contentAr}
          </p>
        )}
        {showThai && (
          <p className="thai-text text-[14px] leading-[2.0] text-[var(--ink-light)]">
            {section.contentTh}
          </p>
        )}
      </div>
    );
  }

  // Tafsir commentary text — indented, smaller, distinct from verse
  return (
    <div className="my-6 pl-4 border-l-2 border-[var(--gold)]/15" id={section.id}>
      {section.titleAr && showArabic && (
        <h3
          className="arabic-text text-base font-bold text-[var(--midnight)] mb-2"
          style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
        >
          {section.titleAr}
        </h3>
      )}
      {section.titleTh && showThai && (
        <h3 className="text-sm font-semibold text-[var(--midnight)] mb-2">
          {section.titleTh}
        </h3>
      )}
      {showArabic && (
        <p
          className="arabic-text text-[16px] leading-[2.3] text-[var(--ink)] mb-3"
          style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}
        >
          {section.contentAr}
        </p>
      )}
      {showThai && (
        <p className="thai-text text-[14px] leading-[2.0] text-[var(--ink-light)] font-light">
          {section.contentTh}
        </p>
      )}
      {mode === 'bilingual' && (
        <div className="divider-gold my-5" />
      )}
    </div>
  );
}
