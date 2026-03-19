'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

interface Segment {
  time: string;
  text: string;
}

interface VideoInfo {
  title: string;
  channel: string;
  thumbnail: string;
}

export default function TranscribePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoId, setVideoId] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSegments([]);
    setVideoInfo(null);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด');
        return;
      }

      setVideoInfo(data.info);
      setVideoId(data.videoId);
      setSegments(data.captions.segments);
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const copyForTranslation = () => {
    const text = segments.map(s => `[${s.time}] ${s.text}`).join('\n');
    const prompt = `แปลข้อความอาหรับต่อไปนี้เป็นภาษาไทย จากวิดีโอ "${videoInfo?.title || ''}"

ให้แปลทีละบรรทัด พร้อม:
1. ระบุถ้ามีอายะฮ์กุรอานหรือหะดีษ
2. สรุปเนื้อหาทั้งหมด
3. จับประเด็นหลักทุกจุดพร้อมรายละเอียด

ข้อความ:
${text}`;

    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">แปลคลิปบรรยายอิสลาม</h1>
          <p className="text-sm text-[var(--color-ink-light)] mt-1">
            วาง URL YouTube → ดึงคำบรรยายอาหรับ → คัดลอกไปแปลใน Claude Code
          </p>
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
              {loading ? 'กำลังดึง...' : 'ดึงคำบรรยาย'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-6 mb-6 text-center">
            <div className="animate-spin h-8 w-8 border-3 border-[var(--color-teal)] border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-teal)]">กำลังดึงคำบรรยายจากวิดีโอ...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        {segments.length > 0 && (
          <>
            {/* Video Info */}
            {videoInfo && (
              <div className="bg-[var(--color-paper)] rounded-xl border border-[var(--color-gold)]/15 p-4 mb-4 flex gap-4 items-center">
                <img src={videoInfo.thumbnail} alt="" className="w-24 h-16 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-ink)] line-clamp-2">{videoInfo.title}</p>
                  <p className="text-xs text-[var(--color-ink-light)] mt-0.5">{videoInfo.channel}</p>
                  <p className="text-[10px] text-[var(--color-ink-light)] mt-1">{segments.length} บรรทัด</p>
                </div>
              </div>
            )}

            {/* Action: Copy for Claude Code */}
            <div className="bg-[var(--color-teal)]/5 border-2 border-[var(--color-teal)]/20 rounded-xl p-4 sm:p-5 mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-teal)] mb-2">วิธีแปลเป็นไทย (ฟรี)</h3>
              <ol className="text-xs text-[var(--color-ink-light)] space-y-1 mb-3 list-decimal list-inside">
                <li>กดปุ่ม <strong>"คัดลอกเพื่อแปล"</strong> ด้านล่าง</li>
                <li>เปิด <strong>Claude Code</strong> หรือ <strong>claude.ai</strong></li>
                <li><strong>วาง (Ctrl+V)</strong> แล้ว Enter</li>
                <li>Claude จะแปล + สรุป + จับประเด็นให้ครบทุกจุด</li>
              </ol>
              <button
                onClick={copyForTranslation}
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)]'
                }`}
              >
                {copied ? '✓ คัดลอกแล้ว! ไปวางใน Claude ได้เลย' : '📋 คัดลอกเพื่อแปล (วางใน Claude Code / claude.ai)'}
              </button>
            </div>

            {/* Arabic Segments */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-3">คำบรรยายอาหรับจากวิดีโอ</h3>
              {segments.map((seg, i) => (
                <div key={i} className="bg-[var(--color-paper)] rounded-lg border border-[var(--color-gold)]/10 p-3 flex gap-3 items-start">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}&t=${seg.time.replace(':', 'm')}s`}
                    target="_blank"
                    rel="noopener"
                    className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-teal)]/10 text-[var(--color-teal)] hover:bg-[var(--color-teal)]/20 mt-1"
                  >
                    {seg.time}
                  </a>
                  <p
                    className="flex-1 text-base leading-[2.2] text-[var(--color-ink)]"
                    style={{ fontFamily: "var(--font-amiri), 'Amiri', serif", direction: 'rtl', textAlign: 'right' }}
                  >
                    {seg.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
