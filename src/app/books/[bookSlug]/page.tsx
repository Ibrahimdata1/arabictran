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

function ReferenceLink({ reference }: { reference: { type: string; textAr: string; textTh: string; source: string; url?: string } }) {
  return (
    <div className={`rounded-lg p-3 text-sm ${
      reference.type === 'quran' ? 'bg-[var(--color-verse-bg)] border border-[var(--color-verse-border)]/30' :
      reference.type === 'hadith' ? 'bg-[var(--color-hadith-bg)] border border-[var(--color-hadith-border)]/30' :
      'bg-[var(--color-cream)] border border-[var(--color-gold)]/15'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
          reference.type === 'quran' ? 'bg-[var(--color-teal)]/10 text-[var(--color-teal)]' :
          reference.type === 'hadith' ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' :
          'bg-[var(--color-ink-light)]/10 text-[var(--color-ink-light)]'
        }`}>
          {reference.type === 'quran' ? 'อัลกุรอาน' : reference.type === 'hadith' ? 'หะดีษ' : reference.type === 'athar' ? 'อะษัร' : 'อุละมาอ์'}
        </span>
        <span className="text-[10px] text-[var(--color-ink-light)]">{reference.source}</span>
      </div>
      {reference.textAr && (
        <p className="text-sm leading-[2] mb-1" dir="rtl" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
          {reference.textAr}
        </p>
      )}
      <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">{reference.textTh}</p>
      {reference.url && (
        <a href={reference.url} target="_blank" rel="noopener" className="text-[10px] text-[var(--color-teal)] hover:underline mt-1 inline-block">
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
                  <ReferenceLink key={i} reference={ref} />
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
                          <ReferenceLink key={j} reference={ref} />
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

// Mind Map Component — Clean CSS-only design, no SVG overlap issues
function MindMap({ topics, readProgress, onSelectTopic }: { topics: Topic[]; readProgress: ReadProgress; onSelectTopic: (id: string) => void }) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  const categories = [
    { label: 'พื้นฐาน', color: '#2d6a6a', bg: '#2d6a6a10', ids: ['topic-1'] },
    { label: 'หลักฐานปฏิเสธ', color: '#c4793a', bg: '#c4793a10', ids: ['topic-2', 'topic-3', 'topic-4'] },
    { label: 'การปฏิเสธ 5 ประการ', color: '#8b5e3c', bg: '#8b5e3c10', ids: ['topic-5', 'topic-6', 'topic-7', 'topic-8', 'topic-9'] },
    { label: 'ตอบโต้ & ทางเลือก', color: '#4a7c59', bg: '#4a7c5910', ids: ['topic-10', 'topic-11'] },
    { label: 'ข้อโต้แย้ง & สรุป', color: '#6b5b8a', bg: '#6b5b8a10', ids: ['topic-12', 'topic-13', 'topic-14'] },
  ];

  return (
    <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-4 sm:p-6">
      {/* Central node */}
      <div className="flex justify-center mb-6">
        <div className="bg-[var(--color-teal)] text-white rounded-2xl px-6 py-3 text-center shadow-lg">
          <p className="text-sm font-bold">อัศ-ศอดิอ์</p>
          <p className="text-[10px] opacity-80 mt-0.5">โต้แย้งกิยาส ร็อยุ ตักลีด อิสติห์สาน ตะอ์ลีล</p>
        </div>
      </div>

      {/* Vertical connector */}
      <div className="w-0.5 h-4 bg-[var(--color-teal)]/30 mx-auto" />

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat, catIdx) => {
          const catTopics = cat.ids.map(id => topics.find(t => t.id === id)).filter(Boolean) as Topic[];
          const readInCat = catTopics.filter(t => readProgress[t.id]).length;
          return (
            <div key={catIdx}>
              {/* Vertical connector between categories */}
              {catIdx > 0 && <div className="w-0.5 h-3 mx-auto" style={{ backgroundColor: cat.color, opacity: 0.2 }} />}

              <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${cat.color}25`, backgroundColor: cat.bg }}>
                {/* Category header */}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${cat.color}15` }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.label}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: cat.color, opacity: 0.7 }}>
                    {readInCat}/{catTopics.length} อ่านแล้ว
                  </span>
                </div>

                {/* Topics grid */}
                <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {catTopics.map((topic) => {
                    const isRead = readProgress[topic.id] || false;
                    const isHovered = hoveredTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id)}
                        onMouseEnter={() => setHoveredTopic(topic.id)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        className={`rounded-lg p-3 text-left transition-all duration-200 ${
                          isRead
                            ? 'bg-[var(--color-teal)]/10 ring-1 ring-[var(--color-teal)]/30'
                            : 'bg-[var(--color-paper)] ring-1 ring-transparent hover:ring-[var(--color-teal)]/20 hover:shadow-sm'
                        }`}
                        style={{ transform: isHovered ? 'translateY(-2px)' : 'none' }}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                            isRead ? 'bg-[var(--color-teal)] text-white' : 'text-white'
                          }`} style={!isRead ? { backgroundColor: cat.color } : {}}>
                            {isRead ? '✓' : topic.number}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[var(--color-ink)] leading-snug">{topic.titleTh}</p>
                            {topic.subtopics.length > 0 && (
                              <p className="text-[10px] mt-1 opacity-60" style={{ color: cat.color }}>
                                {topic.subtopics.length} ประเด็นย่อย
                              </p>
                            )}

                            {/* Show subtopics on hover */}
                            {isHovered && topic.subtopics.length > 0 && (
                              <div className="hidden sm:block mt-2 pt-2 border-t border-[var(--color-gold)]/10 space-y-0.5">
                                {topic.subtopics.slice(0, 4).map((sub) => (
                                  <p key={sub.id} className="text-[9px] text-[var(--color-ink-light)] leading-relaxed line-clamp-1">
                                    • {sub.titleTh}
                                  </p>
                                ))}
                                {topic.subtopics.length > 4 && (
                                  <p className="text-[9px]" style={{ color: cat.color }}>+{topic.subtopics.length - 4} เพิ่มเติม</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-5 pt-3 border-t border-[var(--color-gold)]/10">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-[var(--color-teal)]" />
          <span className="text-[10px] text-[var(--color-ink-light)]">อ่านแล้ว</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-[var(--color-cream-dark)] border border-[var(--color-gold)]/20" />
          <span className="text-[10px] text-[var(--color-ink-light)]">ยังไม่อ่าน</span>
        </div>
        <span className="text-[10px] text-[var(--color-ink-light)]">คลิกเพื่อไปยังประเด็น</span>
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
