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

// Mind Map Component — Interactive radial mind map with SVG connections
function MindMap({ topics, readProgress, onSelectTopic }: { topics: Topic[]; readProgress: ReadProgress; onSelectTopic: (id: string) => void }) {
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);

  // Group topics into categories for visual layout
  const categories = [
    { label: 'พื้นฐาน', color: '#2d6a6a', ids: ['topic-1'] },
    { label: 'หลักฐานปฏิเสธ', color: '#c4793a', ids: ['topic-2', 'topic-3', 'topic-4'] },
    { label: 'การปฏิเสธ', color: '#8b5e3c', ids: ['topic-5', 'topic-6', 'topic-7', 'topic-8', 'topic-9'] },
    { label: 'ตอบโต้ & ทางเลือก', color: '#4a7c59', ids: ['topic-10', 'topic-11'] },
    { label: 'ข้อโต้แย้ง & สรุป', color: '#6b5b8a', ids: ['topic-12', 'topic-13', 'topic-14'] },
  ];

  return (
    <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-3 sm:p-6 overflow-x-auto">
      {/* SVG-based mind map */}
      <div className="relative min-h-[600px] sm:min-h-[700px]" style={{ minWidth: '340px' }}>
        {/* Central node */}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 z-20">
          <div className="bg-[var(--color-teal)] text-white rounded-2xl px-5 py-3 text-center shadow-lg border-2 border-white/20">
            <p className="text-xs sm:text-sm font-bold leading-tight">อัศ-ศอดิอ์</p>
            <p className="text-[10px] sm:text-xs opacity-80 mt-0.5">โต้แย้งกิยาส ร็อยุ ตักลีด</p>
          </div>
        </div>

        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" preserveAspectRatio="none">
          <defs>
            <linearGradient id="line-grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d6a6a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2d6a6a" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="line-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4793a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c4793a" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="line-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5e3c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8b5e3c" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="line-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a7c59" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4a7c59" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="line-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6b5b8a" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#6b5b8a" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {/* Vertical trunk line from center */}
          <line x1="50%" y1="60" x2="50%" y2="110" stroke="var(--color-teal)" strokeWidth="2" strokeOpacity="0.3" />
          {/* Branch lines to each category */}
          {categories.map((cat, i) => {
            const yBase = 120 + i * 110;
            return (
              <g key={i}>
                <line x1="50%" y1="110" x2="50%" y2={yBase} stroke={`url(#line-grad-${i})`} strokeWidth="2" />
                <line x1="50%" y1={yBase} x2="20" y2={yBase} stroke={cat.color} strokeWidth="1.5" strokeOpacity="0.25" />
                <line x1="50%" y1={yBase} x2="100%" y2={yBase} stroke={cat.color} strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4" />
              </g>
            );
          })}
        </svg>

        {/* Category branches */}
        <div className="relative z-10 pt-20">
          {categories.map((cat, catIdx) => {
            const catTopics = cat.ids.map(id => topics.find(t => t.id === id)).filter(Boolean) as Topic[];
            return (
              <div key={catIdx} className="mt-4 first:mt-8">
                {/* Category label */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color, opacity: 0.7 }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cat.color }}>{cat.label}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: cat.color, opacity: 0.15 }} />
                </div>
                {/* Topic nodes */}
                <div className="flex flex-wrap gap-2 px-2">
                  {catTopics.map((topic) => {
                    const isRead = readProgress[topic.id] || false;
                    const isHovered = hoveredTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id)}
                        onMouseEnter={() => setHoveredTopic(topic.id)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        className="relative group transition-all duration-200"
                        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                      >
                        {/* Node */}
                        <div className={`rounded-xl border-2 p-2.5 sm:p-3 text-left transition-all max-w-[220px] ${
                          isRead
                            ? 'border-[var(--color-teal)]/40 bg-[var(--color-teal)]/8 shadow-sm'
                            : 'border-[var(--color-gold)]/20 bg-[var(--color-paper)] hover:border-[var(--color-teal)]/30 hover:shadow-md'
                        }`}
                        style={{ borderLeftColor: isRead ? 'var(--color-teal)' : cat.color, borderLeftWidth: '3px' }}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                              isRead ? 'bg-[var(--color-teal)] text-white' : 'text-white'
                            }`} style={!isRead ? { backgroundColor: cat.color } : {}}>
                              {isRead ? '\u2713' : topic.number}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] sm:text-xs font-semibold text-[var(--color-ink)] leading-tight line-clamp-2">{topic.titleTh}</p>
                              {topic.subtopics.length > 0 && (
                                <p className="text-[9px] mt-1" style={{ color: cat.color }}>
                                  {topic.subtopics.length} ประเด็นย่อย
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Expanded subtopics on hover (desktop) */}
                          {isHovered && topic.subtopics.length > 0 && (
                            <div className="hidden sm:block mt-2 pt-2 border-t border-[var(--color-gold)]/10">
                              {topic.subtopics.slice(0, 4).map((sub) => (
                                <p key={sub.id} className="text-[9px] text-[var(--color-ink-light)] leading-relaxed py-0.5 line-clamp-1">
                                  <span className="inline-block w-1 h-1 rounded-full mr-1 -translate-y-px" style={{ backgroundColor: cat.color, opacity: 0.5 }} />
                                  {sub.titleTh}
                                </p>
                              ))}
                              {topic.subtopics.length > 4 && (
                                <p className="text-[9px] mt-0.5" style={{ color: cat.color }}>+{topic.subtopics.length - 4} เพิ่มเติม</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Connection dot */}
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: isRead ? 'var(--color-teal)' : cat.color }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[var(--color-gold)]/10">
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
