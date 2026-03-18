'use client';

import { Chapter } from '@/lib/types';
import { useState } from 'react';

interface TableOfContentsProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  activeSectionId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onSelectSection: (chapterId: string, sectionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TableOfContents({
  chapters,
  activeChapterId,
  activeSectionId,
  onSelectChapter,
  onSelectSection,
  isOpen,
  onClose,
}: TableOfContentsProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(activeChapterId ? [activeChapterId] : [])
  );

  const toggleChapter = (chapterId: string) => {
    const next = new Set(expandedChapters);
    if (next.has(chapterId)) {
      next.delete(chapterId);
    } else {
      next.add(chapterId);
    }
    setExpandedChapters(next);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 z-50 h-[calc(100vh-4rem)] w-80 transform border-l border-[var(--gold)]/15 bg-[var(--parchment)] transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--gold)]/15 px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            สารบัญ
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded text-[var(--ink-light)] hover:bg-[var(--parchment-dark)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Chapters list */}
        <div className="sidebar-scroll h-[calc(100%-3.5rem)] overflow-y-auto py-2">
          {chapters.map((chapter) => {
            const isActive = chapter.id === activeChapterId;
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <div key={chapter.id} className="px-2">
                {/* Chapter title */}
                <button
                  onClick={() => {
                    toggleChapter(chapter.id);
                    onSelectChapter(chapter.id);
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-right transition-colors ${
                    isActive
                      ? 'bg-[var(--gold)]/8 text-[var(--gold)]'
                      : 'text-[var(--ink-light)] hover:bg-[var(--parchment-dark)] hover:text-[var(--ink)]'
                  }`}
                >
                  {/* Expand icon */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`mt-1 shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium opacity-50 block">
                      บทที่ {chapter.number}
                    </span>
                    <span
                      className="block text-sm arabic-text mt-0.5 leading-relaxed"
                      style={{ fontFamily: "var(--font-amiri), 'Amiri', serif", fontSize: '15px' }}
                    >
                      {chapter.titleAr}
                    </span>
                    <span className="block text-xs mt-0.5 leading-relaxed">
                      {chapter.titleTh}
                    </span>
                  </div>
                </button>

                {/* Sections */}
                {isExpanded && chapter.sections.length > 0 && (
                  <div className="ml-6 mr-1 border-r-2 border-[var(--gold)]/15 py-1">
                    {chapter.sections.map((section) => {
                      const isSectionActive = section.id === activeSectionId;
                      return (
                        <button
                          key={section.id}
                          onClick={() => onSelectSection(chapter.id, section.id)}
                          className={`block w-full pr-3 pl-2 py-1.5 text-right text-xs transition-colors rounded-l ${
                            isSectionActive
                              ? 'toc-active border-r-2 -mr-px bg-[var(--gold)]/5'
                              : 'text-[var(--ink-light)]/70 hover:text-[var(--ink-light)] border-r-2 border-transparent -mr-px'
                          }`}
                        >
                          {section.titleTh || section.titleAr || `ส่วนที่ ${chapter.sections.indexOf(section) + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
