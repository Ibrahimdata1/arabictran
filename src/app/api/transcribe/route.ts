import { NextRequest, NextResponse } from 'next/server';

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

// Fetch YouTube captions/subtitles
async function fetchYouTubeCaptions(videoId: string): Promise<{ ar: string; segments: { time: string; text: string }[] } | null> {
  try {
    // Get video page to find caption tracks
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'Accept-Language': 'ar,en' },
    });
    const pageHtml = await pageRes.text();

    // Extract captions player response
    const captionMatch = pageHtml.match(new RegExp('"captions":\\s*(\\{.*?"playerCaptionsTracklistRenderer".*?\\})\\s*,\\s*"videoDetails"', 's'));
    if (!captionMatch) return null;

    // Find Arabic caption track
    const captionData = JSON.parse(captionMatch[1]);
    const tracks = captionData?.playerCaptionsTracklistRenderer?.captionTracks || [];

    // Prefer Arabic, then any available
    let track = tracks.find((t: { languageCode: string }) => t.languageCode === 'ar');
    if (!track) track = tracks[0];
    if (!track?.baseUrl) return null;

    // Fetch the caption XML
    const captionRes = await fetch(track.baseUrl);
    const captionXml = await captionRes.text();

    // Parse XML captions
    const segments: { time: string; text: string }[] = [];
    const regex = /<text start="([^"]+)" dur="[^"]*">(.*?)<\/text>/g;
    let match;
    while ((match = regex.exec(captionXml)) !== null) {
      const startSec = parseFloat(match[1]);
      const mins = Math.floor(startSec / 60);
      const secs = Math.floor(startSec % 60);
      const time = `${mins}:${secs.toString().padStart(2, '0')}`;
      const text = match[2]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/<[^>]+>/g, '');
      segments.push({ time, text });
    }

    const fullText = segments.map(s => s.text).join(' ');
    return { ar: fullText, segments };
  } catch {
    return null;
  }
}

// Get video info
async function getVideoInfo(videoId: string): Promise<{ title: string; channel: string; thumbnail: string } | null> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return {
      title: data.title || '',
      channel: data.author_name || '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const videoId = extractVideoId(url);
    if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

    // Get video info
    const info = await getVideoInfo(videoId);

    // Fetch captions
    const captions = await fetchYouTubeCaptions(videoId);

    if (!captions || captions.segments.length === 0) {
      return NextResponse.json({
        error: 'ไม่พบคำบรรยาย (subtitles) ในวิดีโอนี้ กรุณาใช้วิดีโอที่มีคำบรรยายภาษาอาหรับ',
      }, { status: 404 });
    }

    return NextResponse.json({
      videoId,
      info,
      captions,
    });
  } catch (err) {
    console.error('Transcribe error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
