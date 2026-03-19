import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export async function POST(req: NextRequest) {
  try {
    const { segments, videoTitle } = await req.json();
    if (!segments || !Array.isArray(segments)) {
      return NextResponse.json({ error: 'segments required' }, { status: 400 });
    }

    const arabicText = segments.map((s: { time: string; text: string }) => `[${s.time}] ${s.text}`).join('\n');

    const prompt = `คุณเป็นผู้เชี่ยวชาญด้านภาษาอาหรับและอิสลาม ที่แปลได้สละสลวยเป็นภาษาไทย

วิดีโอ: "${videoTitle || 'บรรยายอิสลาม'}"

นี่คือข้อความภาษาอาหรับจากวิดีโอ พร้อม timestamp:
${arabicText}

กรุณาทำสิ่งต่อไปนี้ โดยตอบเป็น JSON เท่านั้น:

1. **แปลทีละบรรทัด**: แปลแต่ละ segment เป็นภาษาไทย สำนวนสละสลวย ถูกต้องตามหลักศาสนา
   - ถ้ามีอายะฮ์กุรอาน ให้ระบุ สูเราะฮ์:อายะฮ์
   - ถ้ามีหะดีษ ให้ระบุแหล่งอ้างอิง

2. **สรุปเนื้อหา**: สรุปสั้น ๆ 2-3 ประโยค

3. **จับประเด็น**: แยกประเด็นหลักทั้งหมดจากเนื้อหา แต่ละประเด็นต้องมี:
   - หัวข้อ
   - รายละเอียดครบถ้วนไม่ขาดตกบกพร่อง
   - timestamp ที่พูดถึง
   - อ้างอิง (ถ้ามี)
   - ประเด็นย่อย (ถ้ามี)

ตอบเป็น JSON format นี้เท่านั้น ไม่ต้องมีข้อความอื่น:
{
  "translations": [
    { "time": "0:00", "ar": "ข้อความอาหรับ", "th": "คำแปลไทย", "type": "text|quran|hadith", "ref": "อ้างอิง ถ้ามี" }
  ],
  "summary": "สรุปเนื้อหาภาษาไทย",
  "topics": [
    {
      "title": "หัวข้อประเด็น",
      "detail": "รายละเอียดครบถ้วน",
      "timestamp": "0:00",
      "references": ["อ้างอิง"],
      "subtopics": [
        { "title": "ประเด็นย่อย", "detail": "รายละเอียด" }
      ]
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'ไม่สามารถแปลได้ กรุณาลองใหม่' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Translate error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแปล กรุณาลองใหม่' }, { status: 500 });
  }
}
