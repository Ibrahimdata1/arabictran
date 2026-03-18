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
      <div className="quran-verse my-6" id={section.id}>
        {section.reference && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-verse-border)]/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <span className="text-xs font-medium text-[var(--color-teal)]">
              {section.reference}
            </span>
          </div>
        )}
        {showArabic && (
          <p className="arabic-text text-xl leading-[2.4] text-[var(--color-ink)] mb-3" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
            {section.contentAr}
          </p>
        )}
        {showThai && (
          <p className="thai-text text-[15px] leading-[2] text-[var(--color-ink-light)]">
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
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-hadith-border)]/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
            </svg>
            <span className="text-xs font-medium text-[var(--color-gold)]">
              {section.reference}
            </span>
          </div>
        )}
        {showArabic && (
          <p className="arabic-text text-lg leading-[2.2] text-[var(--color-ink)] mb-3" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
            {section.contentAr}
          </p>
        )}
        {showThai && (
          <p className="thai-text text-[15px] leading-[2] text-[var(--color-ink-light)]">
            {section.contentTh}
          </p>
        )}
      </div>
    );
  }

  // Regular text
  return (
    <div className="my-5" id={section.id}>
      {section.titleAr && showArabic && (
        <h3 className="arabic-text text-lg font-bold text-[var(--color-ink)] mb-2" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
          {section.titleAr}
        </h3>
      )}
      {section.titleTh && showThai && (
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-2">
          {section.titleTh}
        </h3>
      )}
      {showArabic && (
        <p className="arabic-text text-lg leading-[2.2] text-[var(--color-ink)] mb-3" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
          {section.contentAr}
        </p>
      )}
      {showThai && (
        <p className="thai-text text-[15px] leading-[1.95] text-[var(--color-ink-light)]">
          {section.contentTh}
        </p>
      )}
      {mode === 'bilingual' && (
        <div className="divider-gold my-4" />
      )}
    </div>
  );
}
