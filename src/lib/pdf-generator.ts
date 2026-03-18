'use client';

import { Book, Chapter, DisplayMode } from './types';

// Volume splitting logic
export function splitIntoVolumes(chapters: Chapter[], maxChaptersPerVolume: number = 10): Chapter[][] {
  const volumes: Chapter[][] = [];
  for (let i = 0; i < chapters.length; i += maxChaptersPerVolume) {
    volumes.push(chapters.slice(i, i + maxChaptersPerVolume));
  }
  return volumes;
}

export function getVolumeInfo(book: Book, maxPerVolume: number = 10) {
  const volumes = splitIntoVolumes(book.chapters, maxPerVolume);
  return volumes.map((chapters, idx) => ({
    number: idx + 1,
    total: volumes.length,
    chapters,
    label: `เล่มที่ ${idx + 1}`,
    range: `สูเราะฮ์ ${chapters[0]?.titleTh} - ${chapters[chapters.length - 1]?.titleTh}`,
    chapterRange: `${chapters[0]?.number} - ${chapters[chapters.length - 1]?.number}`,
  }));
}

function buildSectionHtml(section: { type: string; titleAr?: string; titleTh?: string; contentAr: string; contentTh: string; reference?: string }, mode: DisplayMode): string {
  const showAr = mode === 'arabic' || mode === 'bilingual';
  const showTh = mode === 'thai' || mode === 'bilingual';

  let html = '';

  if (section.type === 'quran') {
    html += `<div style="background:#EEF6F6;border-right:4px solid #0D7377;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0;">`;
    if (section.reference) {
      html += `<div style="font-size:11px;color:#0D7377;font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #C8E0E0;">📖 ${section.reference}</div>`;
    }
    if (showAr) {
      html += `<p style="direction:rtl;text-align:right;font-family:'Amiri','Traditional Arabic','Arial';font-size:18px;line-height:2.2;color:#1a1a1a;margin:0 0 8px 0;">${section.contentAr}</p>`;
    }
    if (showTh) {
      html += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${section.contentTh}</p>`;
    }
    html += `</div>`;
  } else if (section.type === 'hadith') {
    html += `<div style="background:#FFF8EC;border-right:4px solid #C4A35A;border-radius:0 8px 8px 0;padding:16px 20px;margin:12px 0;">`;
    if (section.reference) {
      html += `<div style="font-size:11px;color:#C4A35A;font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #E8D5A8;">📜 ${section.reference}</div>`;
    }
    if (showAr) {
      html += `<p style="direction:rtl;text-align:right;font-family:'Amiri','Traditional Arabic','Arial';font-size:16px;line-height:2.2;color:#1a1a1a;margin:0 0 8px 0;">${section.contentAr}</p>`;
    }
    if (showTh) {
      html += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${section.contentTh}</p>`;
    }
    html += `</div>`;
  } else {
    html += `<div style="margin:14px 0;">`;
    if (section.titleAr && showAr) {
      html += `<h3 style="direction:rtl;text-align:right;font-family:'Amiri','Traditional Arabic','Arial';font-size:16px;font-weight:bold;color:#1a1a1a;margin:0 0 6px 0;">${section.titleAr}</h3>`;
    }
    if (section.titleTh && showTh) {
      html += `<h3 style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 6px 0;">${section.titleTh}</h3>`;
    }
    if (showAr) {
      html += `<p style="direction:rtl;text-align:right;font-family:'Amiri','Traditional Arabic','Arial';font-size:16px;line-height:2.2;color:#2a2a2a;margin:0 0 8px 0;">${section.contentAr}</p>`;
    }
    if (showTh) {
      html += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${section.contentTh}</p>`;
    }
    if (mode === 'bilingual') {
      html += `<hr style="border:none;height:1px;background:linear-gradient(90deg,transparent,#C4A35A40,transparent);margin:12px 0;" />`;
    }
    html += `</div>`;
  }

  return html;
}

function buildChapterHtml(chapter: Chapter, mode: DisplayMode): string {
  let html = `<div style="page-break-before:always;"></div>`;
  html += `<div style="text-align:center;margin:40px 0 30px 0;">`;
  html += `<p style="direction:rtl;font-family:'Amiri','Traditional Arabic','Arial';font-size:24px;font-weight:bold;color:#0D7377;margin:0 0 8px 0;">${chapter.titleAr}</p>`;
  html += `<div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,#C4A35A,transparent);margin:8px auto;"></div>`;
  html += `<p style="font-size:18px;font-weight:600;color:#2C2417;margin:8px 0 0 0;">${chapter.titleTh}</p>`;
  html += `</div>`;

  for (const section of chapter.sections) {
    html += buildSectionHtml(section, mode);
  }

  return html;
}

export async function generatePdf(
  book: Book,
  chapters: Chapter[],
  mode: DisplayMode,
  volumeLabel?: string
): Promise<void> {
  // Dynamic imports for client-side only
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Build full HTML content
  let fullHtml = `
    <div style="text-align:center;padding:60px 40px 40px 40px;">
      <p style="direction:rtl;font-family:'Amiri','Traditional Arabic','Arial';font-size:30px;font-weight:bold;color:#0D7377;margin:0;">${book.titleAr}</p>
      <div style="width:100px;height:2px;background:#C4A35A;margin:16px auto;"></div>
      <p style="font-size:22px;font-weight:600;color:#2C2417;margin:8px 0;">${book.titleTh}</p>
      <p style="direction:rtl;font-family:'Amiri','Traditional Arabic','Arial';font-size:14px;color:#666;margin:8px 0;">${book.authorAr}</p>
      <p style="font-size:13px;color:#666;margin:4px 0;">${book.authorTh}</p>
      ${volumeLabel ? `<p style="font-size:16px;font-weight:600;color:#0D7377;margin:20px 0 0 0;padding:8px 20px;border:2px solid #0D737740;border-radius:8px;display:inline-block;">${volumeLabel}</p>` : ''}
      <p style="font-size:11px;color:#999;margin:30px 0 0 0;">ArabicTran - ห้องสมุดอิสลาม | arabictran.vercel.app</p>
    </div>
  `;

  // Table of contents
  fullHtml += `<div style="page-break-before:always;padding:20px 0;">`;
  fullHtml += `<h2 style="text-align:center;font-size:20px;color:#0D7377;margin-bottom:20px;">สารบัญ</h2>`;
  for (const ch of chapters) {
    fullHtml += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dotted #ddd;">`;
    fullHtml += `<span style="font-size:13px;color:#2C2417;">${ch.titleTh}</span>`;
    fullHtml += `<span style="direction:rtl;font-family:'Amiri','Traditional Arabic','Arial';font-size:14px;color:#666;">${ch.titleAr}</span>`;
    fullHtml += `</div>`;
  }
  fullHtml += `</div>`;

  // Content
  for (const chapter of chapters) {
    fullHtml += buildChapterHtml(chapter, mode);
  }

  // Footer
  fullHtml += `<div style="page-break-before:always;text-align:center;padding:80px 40px;">`;
  fullHtml += `<div style="width:60px;height:2px;background:#C4A35A;margin:0 auto 20px auto;"></div>`;
  fullHtml += `<p style="font-size:14px;color:#666;">คำแปลอัลกุรอานอ้างอิงจาก quran.com</p>`;
  fullHtml += `<p style="font-size:14px;color:#666;">ตัฟซีรอาหรับจาก Quran.com API</p>`;
  fullHtml += `<p style="font-size:12px;color:#999;margin-top:20px;">ArabicTran © ${new Date().getFullYear()}</p>`;
  fullHtml += `</div>`;

  // Create hidden container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: -9999px;
    width: 595px;
    padding: 30px;
    background: white;
    font-family: 'Noto Sans Thai', sans-serif;
    color: #2C2417;
    z-index: -1;
  `;
  container.innerHTML = fullHtml;
  document.body.appendChild(container);

  try {
    // Wait for fonts to load
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(container, {
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 595,
    } as any);

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const fileName = volumeLabel
      ? `${book.titleEn.replace(/[^a-zA-Z0-9]/g, '_')}_${volumeLabel.replace(/\s/g, '_')}.pdf`
      : `${book.titleEn.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
