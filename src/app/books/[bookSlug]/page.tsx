'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BookSummary, Topic, ReadProgress } from '@/lib/book-summary-types';
import { allBookSummaries } from '@/data/book-summaries';

function ProgressBar({ read, total }: { read: number; total: number }) {
  const pct = total > 0 ? Math.round((read / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--color-cream-dark)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-teal)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--color-ink-light)] tabular-nums">{read}/{total} ({pct}%)</span>
    </div>
  );
}

function ReferenceLink({ ref }: { ref: { type: string; textAr: string; textTh: string; source: string; url?: string } }) {
  return (
    <div className={`rounded-lg p-3 text-sm ${
      ref.type === 'quran' ? 'bg-[var(--color-verse-bg)] border border-[var(--color-verse-border)]/30' :
      ref.type === 'hadith' ? 'bg-[var(--color-hadith-bg)] border border-[var(--color-hadith-border)]/30' :
      'bg-[var(--color-cream)] border border-[var(--color-gold)]/15'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
          ref.type === 'quran' ? 'bg-[var(--color-teal)]/10 text-[var(--color-teal)]' :
          ref.type === 'hadith' ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' :
          'bg-[var(--color-ink-light)]/10 text-[var(--color-ink-light)]'
        }`}>
          {ref.type === 'quran' ? 'อัลกุรอาน' : ref.type === 'hadith' ? 'หะดีษ' : ref.type === 'athar' ? 'อะษัร' : 'อุละมาอ์'}
        </span>
        <span className="text-[10px] text-[var(--color-ink-light)]">{ref.source}</span>
      </div>
      {ref.textAr && (
        <p className="text-sm leading-[2] mb-1" dir="rtl" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
          {ref.textAr}
        </p>
      )}
      <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">{ref.textTh}</p>
      {ref.url && (
        <a href={ref.url} target="_blank" rel="noopener" className="text-[10px] text-[var(--color-teal)] hover:underline mt-1 inline-block">
          ดูแหล่งอ้างอิง →
        </a>
      )}
    </div>
  );
}

function TopicCard({ topic, isRead, onToggleRead, isExpanded, onToggle }: {
  topic: Topic;
  isRead: boolean;
  onToggleRead: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${
      isRead ? 'border-[var(--color-teal)]/20 bg-[var(--color-teal)]/3' : 'border-[var(--color-gold)]/15 bg-[var(--color-paper)]'
    }`}>
      {/* Header - always visible */}
      <button onClick={onToggle} className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--color-cream)] transition-colors">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          isRead ? 'bg-[var(--color-teal)] text-white' : 'bg-[var(--color-cream-dark)] text-[var(--color-ink-light)]'
        }`}>
          {isRead ? '✓' : topic.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{topic.titleTh}</p>
          {topic.titleAr && (
            <p className="text-xs text-[var(--color-ink-light)] mt-0.5" dir="rtl" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
              {topic.titleAr}
            </p>
          )}
          {topic.page && <span className="text-[10px] text-[var(--color-ink-light)]">หน้า {topic.page}</span>}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`shrink-0 text-[var(--color-ink-light)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-gold)]/10">
          {/* Summary from book */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)]">สรุปจากเล่ม</span>
            </div>
            <p className="text-sm text-[var(--color-ink)] leading-relaxed">{topic.summary}</p>
          </div>

          {/* References */}
          {topic.references.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-[var(--color-ink-light)] mb-2">หลักฐานอ้างอิง ({topic.references.length})</p>
              <div className="space-y-2">
                {topic.references.map((ref, i) => (
                  <ReferenceLink key={i} ref={ref} />
                ))}
              </div>
            </div>
          )}

          {/* Subtopics */}
          {topic.subtopics.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold text-[var(--color-ink-light)] mb-2">ประเด็นย่อย ({topic.subtopics.length})</p>
              <div className="space-y-3 pl-3 border-l-2 border-[var(--color-gold)]/15">
                {topic.subtopics.map((sub) => (
                  <div key={sub.id}>
                    <p className="text-xs font-semibold text-[var(--color-ink)]">{sub.titleTh}</p>
                    <p className="text-xs text-[var(--color-ink-light)] leading-relaxed mt-1">{sub.summary}</p>
                    {sub.analysis && (
                      <div className="mt-2 pl-3 border-l-2 border-[var(--color-teal)]/20">
                        <span className="text-[9px] font-semibold text-[var(--color-teal)]">วิเคราะห์:</span>
                        <p className="text-[11px] text-[var(--color-ink-light)] leading-relaxed">{sub.analysis}</p>
                      </div>
                    )}
                    {sub.references.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {sub.references.map((ref, j) => (
                          <ReferenceLink key={j} ref={ref} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis */}
          {topic.analysis && (
            <div className="mt-4 bg-[var(--color-teal)]/5 rounded-lg p-3 border border-[var(--color-teal)]/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-teal)]/15 text-[var(--color-teal)]">บทวิเคราะห์</span>
              </div>
              <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">{topic.analysis}</p>
            </div>
          )}

          {/* Mark as read */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleRead(); }}
            className={`mt-4 w-full rounded-lg py-2 text-xs font-medium transition-colors ${
              isRead
                ? 'bg-[var(--color-cream-dark)] text-[var(--color-ink-light)] hover:bg-red-50 hover:text-red-500'
                : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)]'
            }`}
          >
            {isRead ? 'ยกเลิกการอ่าน' : '✓ อ่านจบแล้ว'}
          </button>
        </div>
      )}
    </div>
  );
}

// Mind Map Component
function MindMap({ topics, readProgress, onSelectTopic }: { topics: Topic[]; readProgress: ReadProgress; onSelectTopic: (id: string) => void }) {
  return (
    <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-4 sm:p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4 text-center">Mind Map</h3>
      <div className="flex flex-col items-center gap-2 min-w-[300px]">
        {/* Center node */}
        <div className="bg-[var(--color-teal)] text-white rounded-xl px-4 py-2 text-xs font-semibold text-center max-w-[200px]">
          การโต้แย้งเรื่องกิยาส
        </div>
        <div className="w-px h-4 bg-[var(--color-gold)]" />
        {/* Topic branches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {topics.map((topic) => {
            const isRead = readProgress[topic.id] || false;
            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className={`rounded-lg border p-3 text-left text-xs transition-all hover:shadow-sm ${
                  isRead
                    ? 'border-[var(--color-teal)]/30 bg-[var(--color-teal)]/5'
                    : 'border-[var(--color-gold)]/15 bg-[var(--color-paper)] hover:border-[var(--color-teal)]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold ${
                    isRead ? 'bg-[var(--color-teal)] text-white' : 'bg-[var(--color-cream-dark)] text-[var(--color-ink-light)]'
                  }`}>
                    {isRead ? '✓' : topic.number}
                  </span>
                  <span className="font-medium text-[var(--color-ink)] line-clamp-2">{topic.titleTh}</span>
                </div>
                {topic.subtopics.length > 0 && (
                  <div className="mt-2 pl-7 space-y-0.5">
                    {topic.subtopics.slice(0, 3).map((sub) => (
                      <p key={sub.id} className="text-[10px] text-[var(--color-ink-light)] line-clamp-1">• {sub.titleTh}</p>
                    ))}
                    {topic.subtopics.length > 3 && (
                      <p className="text-[10px] text-[var(--color-teal)]">+{topic.subtopics.length - 3} ประเด็นย่อย</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BookSummaryPage() {
  const params = useParams();
  const slug = params.bookSlug as string;
  const book = allBookSummaries.find((b) => b.slug === slug);

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [readProgress, setReadProgress] = useState<ReadProgress>({});
  const [activeView, setActiveView] = useState<'list' | 'mindmap'>('list');

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`book_progress_${slug}`);
    if (saved) setReadProgress(JSON.parse(saved));
  }, [slug]);

  const toggleRead = (topicId: string) => {
    const next = { ...readProgress, [topicId]: !readProgress[topicId] };
    setReadProgress(next);
    localStorage.setItem(`book_progress_${slug}`, JSON.stringify(next));
  };

  const readCount = Object.values(readProgress).filter(Boolean).length;

  if (!book) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-[var(--color-ink-light)]">ไม่พบหนังสือ</p>
      </div>
    );
  }

  const scrollToTopic = (id: string) => {
    setActiveView('list');
    setExpandedTopic(id);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Book header */}
        <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-5 sm:p-6 mb-6">
          <p className="text-xl font-bold text-[var(--color-ink)] mb-1">{book.titleTh}</p>
          <p className="text-base text-[var(--color-ink-light)] mb-1" dir="rtl" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
            {book.titleAr}
          </p>
          <p className="text-xs text-[var(--color-ink-light)] mb-1">{book.authorTh} | ตะห์กีก: {book.editorTh}</p>
          <p className="text-xs text-[var(--color-ink-light)] leading-relaxed mt-2">{book.description}</p>

          {/* Progress */}
          <div className="mt-4">
            <ProgressBar read={readCount} total={book.totalTopics} />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 mb-4 bg-[var(--color-paper)] rounded-lg p-1 border border-[var(--color-gold)]/15">
          <button
            onClick={() => setActiveView('list')}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeView === 'list' ? 'bg-[var(--color-teal)] text-white' : 'text-[var(--color-ink-light)]'
            }`}
          >
            รายการประเด็น
          </button>
          <button
            onClick={() => setActiveView('mindmap')}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeView === 'mindmap' ? 'bg-[var(--color-teal)] text-white' : 'text-[var(--color-ink-light)]'
            }`}
          >
            Mind Map
          </button>
        </div>

        {/* Mind Map View */}
        {activeView === 'mindmap' && (
          <MindMap topics={book.topics} readProgress={readProgress} onSelectTopic={scrollToTopic} />
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="space-y-3">
            {book.topics.map((topic) => (
              <div key={topic.id} id={topic.id}>
                <TopicCard
                  topic={topic}
                  isRead={readProgress[topic.id] || false}
                  onToggleRead={() => toggleRead(topic.id)}
                  isExpanded={expandedTopic === topic.id}
                  onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
