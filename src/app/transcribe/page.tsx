'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

interface Translation {
  time: string;
  ar: string;
  th: string;
  type: string;
  ref?: string;
}

interface Topic {
  title: string;
  detail: string;
  timestamp: string;
  references?: string[];
  subtopics?: { title: string; detail: string }[];
}

interface TranscribeResult {
  translations: Translation[];
  summary: string;
  topics: Topic[];
}

interface VideoInfo {
  title: string;
  channel: string;
  thumbnail: string;
}

export default function TranscribePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoId, setVideoId] = useState('');
  const [result, setResult] = useState<TranscribeResult | null>(null);
  const [error, setError] = useState('');
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'lines' | 'topics' | 'summary'>('topics');

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setVideoInfo(null);

    try {
      // Step 1: Get captions
      setStatus('กำลังดึงคำบรรยายจากวิดีโอ...');
      const capRes = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const capData = await capRes.json();

      if (!capRes.ok) {
        setError(capData.error || 'เกิดข้อผิดพลาด');
        setLoading(false);
        return;
      }

      setVideoInfo(capData.info);
      setVideoId(capData.videoId);

      // Step 2: Translate + analyze
      setStatus('กำลังแปลและวิเคราะห์เนื้อหา...');
      const transRes = await fetch('/api/transcribe/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: capData.captions.segments,
          videoTitle: capData.info?.title || '',
        }),
      });
      const transData = await transRes.json();

      if (!transRes.ok) {
        setError(transData.error || 'เกิดข้อผิดพลาดในการแปล');
        setLoading(false);
        return;
      }

      setResult(transData);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">แปลคลิปบรรยายอิสลาม</h1>
          <p className="text-sm text-[var(--color-ink-light)] mt-1">วางลิงก์ YouTube → แปลอาหรับเป็นไทย พร้อมจับประเด็นทุกจุด</p>
        </div>

        {/* URL Input */}
        <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-4 sm:p-6 mb-6">
          <label className="text-sm font-medium text-[var(--color-ink)] mb-2 block">ลิงก์ YouTube</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)]/30"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              dir="ltr"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="shrink-0 rounded-lg bg-[var(--color-teal)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-teal-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? 'กำลังทำ...' : 'แปล'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-6 mb-6 text-center">
            <div className="animate-spin h-8 w-8 border-3 border-[var(--color-teal)] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-teal)]">{status}</p>
            <p className="text-xs text-[var(--color-ink-light)] mt-1">อาจใช้เวลาสักครู่</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-4 mb-6 flex gap-4 items-center">
            <img src={videoInfo.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2">{videoInfo.title}</p>
              <p className="text-xs text-[var(--color-ink-light)] mt-0.5">{videoInfo.channel}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[var(--color-paper)] rounded-lg p-1 border border-[var(--color-gold)]/15">
              {([
                { key: 'topics' as const, label: 'ประเด็น', count: result.topics.length },
                { key: 'lines' as const, label: 'แปลทีละบรรทัด', count: result.translations.length },
                { key: 'summary' as const, label: 'สรุป' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[var(--color-teal)] text-white'
                      : 'text-[var(--color-ink-light)] hover:bg-[var(--color-cream)]'
                  }`}
                >
                  {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* Topics View */}
            {activeTab === 'topics' && (
              <div className="space-y-3">
                {result.topics.map((topic, i) => (
                  <div key={i} className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 overflow-hidden">
                    <button
                      onClick={() => setExpandedTopic(expandedTopic === i ? null : i)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--color-cream)] transition-colors"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-teal)]/10 text-xs font-bold text-[var(--color-teal)]">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-ink)]">{topic.title}</p>
                        {topic.timestamp && (
                          <a
                            href={`https://www.youtube.com/watch?v=${videoId}&t=${topic.timestamp.replace(':', 'm')}s`}
                            target="_blank"
                            rel="noopener"
                            className="text-[10px] text-[var(--color-teal)] mt-0.5 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ⏱ {topic.timestamp}
                          </a>
                        )}
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        className={`shrink-0 text-[var(--color-ink-light)] transition-transform ${expandedTopic === i ? 'rotate-180' : ''}`}>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {expandedTopic === i && (
                      <div className="px-4 pb-4 border-t border-[var(--color-gold)]/10">
                        <p className="text-sm text-[var(--color-ink-light)] leading-relaxed mt-3">{topic.detail}</p>

                        {topic.references && topic.references.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {topic.references.map((ref, j) => (
                              <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-gold-pale)] text-[var(--color-ink-light)]">
                                {ref}
                              </span>
                            ))}
                          </div>
                        )}

                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="mt-3 space-y-2 pl-4 border-l-2 border-[var(--color-gold)]/15">
                            {topic.subtopics.map((sub, j) => (
                              <div key={j}>
                                <p className="text-xs font-semibold text-[var(--color-ink)]">{sub.title}</p>
                                <p className="text-xs text-[var(--color-ink-light)] leading-relaxed">{sub.detail}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Line-by-line View */}
            {activeTab === 'lines' && (
              <div className="space-y-2">
                {result.translations.map((line, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-3 sm:p-4 ${
                      line.type === 'quran'
                        ? 'bg-[var(--color-verse-bg)] border-[var(--color-verse-border)]'
                        : line.type === 'hadith'
                        ? 'bg-[var(--color-hadith-bg)] border-[var(--color-hadith-border)]'
                        : 'bg-[var(--color-paper)] border-[var(--color-gold)]/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}&t=${line.time.replace(':', 'm')}s`}
                        target="_blank"
                        rel="noopener"
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-teal)]/10 text-[var(--color-teal)] hover:bg-[var(--color-teal)]/20"
                      >
                        {line.time}
                      </a>
                      {line.type === 'quran' && <span className="text-[10px] font-semibold text-[var(--color-teal)]">อัลกุรอาน</span>}
                      {line.type === 'hadith' && <span className="text-[10px] font-semibold text-[var(--color-gold)]">หะดีษ</span>}
                      {line.ref && <span className="text-[10px] text-[var(--color-ink-light)]">{line.ref}</span>}
                    </div>
                    <p className="arabic-text text-base leading-[2.2] text-[var(--color-ink)] mb-1" style={{ fontFamily: "var(--font-amiri), 'Amiri', serif" }}>
                      {line.ar}
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--color-ink-light)]">{line.th}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Summary View */}
            {activeTab === 'summary' && (
              <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)] mb-3">สรุปเนื้อหา</h3>
                <p className="text-sm text-[var(--color-ink-light)] leading-relaxed">{result.summary}</p>

                <div className="mt-6">
                  <h3 className="text-base font-semibold text-[var(--color-ink)] mb-3">ประเด็นทั้งหมด ({result.topics.length} ประเด็น)</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {result.topics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveTab('topics'); setExpandedTopic(i); }}
                        className="flex items-center gap-2 rounded-lg border border-[var(--color-gold)]/15 p-3 text-left hover:border-[var(--color-teal)]/30 transition-colors"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--color-teal)]/10 text-[10px] font-bold text-[var(--color-teal)]">{i + 1}</span>
                        <span className="text-xs font-medium text-[var(--color-ink)] line-clamp-2">{topic.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
