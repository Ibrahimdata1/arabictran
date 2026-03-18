'use client';

import { Book, Chapter, DisplayMode } from './types';

export function getVolumeInfo(book: Book, maxPerVolume: number = 10) {
  const volumes: { number: number; chapters: Chapter[]; label: string; names: string }[] = [];
  for (let i = 0; i < book.chapters.length; i += maxPerVolume) {
    const chs = book.chapters.slice(i, i + maxPerVolume);
    const num = volumes.length + 1;
    volumes.push({
      number: num,
      chapters: chs,
      label: `เล่มที่ ${num}`,
      names: `${chs[0].titleTh} — ${chs[chs.length - 1].titleTh}`,
    });
  }
  return volumes;
}

// Build section-by-section HTML blocks for rendering
function buildBlockHtml(
  content: string,
  isTitle: boolean = false,
): string {
  return `<div style="padding:2px 0;">${isTitle ? `<div style="font-weight:600;">${content}</div>` : content}</div>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function generateAndDownloadPdf(
  book: Book,
  chapters: Chapter[],
  mode: DisplayMode,
  volumeLabel?: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const showAr = mode === 'arabic' || mode === 'bilingual';
  const showTh = mode === 'thai' || mode === 'bilingual';

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth(); // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const marginX = 15;
  const marginTop = 15;
  const marginBot = 20;
  const contentW = pageW - marginX * 2; // 180mm
  const usableH = pageH - marginTop - marginBot; // 262mm
  const renderWidthPx = 680; // pixel width for rendering

  // Helper: render HTML block to image and get dimensions in mm
  async function renderBlock(html: string): Promise<{ imgData: string; wMm: number; hMm: number }> {
    const container = document.createElement('div');
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${renderWidthPx}px;background:white;font-family:'Noto Sans Thai',sans-serif;color:#2C2417;padding:8px 12px;`;
    container.innerHTML = html;
    document.body.appendChild(container);

    await document.fonts.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(container, { backgroundColor: '#ffffff', logging: false, windowWidth: renderWidthPx } as any);
    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const wMm = contentW;
    const hMm = (canvas.height / canvas.width) * contentW;
    return { imgData, wMm, hMm };
  }

  let currentY = marginTop;
  let isFirstPage = true;

  function addPageIfNeeded(blockH: number) {
    if (currentY + blockH > pageH - marginBot) {
      // Add page number footer
      addFooter();
      pdf.addPage();
      currentY = marginTop;
    }
  }

  function addFooter() {
    const pageNum = pdf.getNumberOfPages();
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`${pageNum}`, pageW / 2, pageH - 8, { align: 'center' });
    pdf.text('ArabicTran', pageW - marginX, pageH - 8, { align: 'right' });
  }

  // ===== COVER PAGE =====
  onProgress?.(5);
  const coverHtml = `
    <div style="text-align:center;padding:60px 30px;">
      <p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;font-size:18px;color:#E8A04C;margin:0 0 40px 0;">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
      <div style="border:2px solid #E8A04C;padding:40px 30px;display:inline-block;position:relative;">
        <p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;font-size:28px;font-weight:bold;color:#C75B12;margin:0 0 10px 0;">${escHtml(book.titleAr)}</p>
        <div style="width:100px;height:2px;background:linear-gradient(90deg,transparent,#E8A04C,transparent);margin:12px auto;"></div>
        <p style="font-size:20px;font-weight:600;color:#2C2417;margin:10px 0;">${escHtml(book.titleTh)}</p>
        <p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;font-size:13px;color:#666;margin:16px 0 4px 0;">${escHtml(book.authorAr)}</p>
        <p style="font-size:11px;color:#666;margin:0;">${escHtml(book.authorTh)}</p>
        ${volumeLabel ? `<p style="font-size:14px;font-weight:600;color:#C75B12;margin:20px 0 0;padding:6px 20px;border:1.5px solid #C75B1240;border-radius:6px;display:inline-block;">${escHtml(volumeLabel)}</p>` : ''}
      </div>
      <div style="margin-top:40px;">
        <div style="width:60px;height:1px;background:#E8A04C;margin:0 auto 8px;"></div>
        <p style="font-size:9px;color:#aaa;">ArabicTran - ห้องสมุดอิสลาม</p>
        <p style="font-size:8px;color:#ccc;">arabictran.vercel.app</p>
      </div>
    </div>
  `;
  const coverImg = await renderBlock(coverHtml);
  // Center cover vertically
  const coverY = Math.max(marginTop, (pageH - coverImg.hMm) / 2);
  pdf.addImage(coverImg.imgData, 'PNG', marginX, coverY, coverImg.wMm, coverImg.hMm);

  // ===== TOC PAGE =====
  onProgress?.(10);
  pdf.addPage();
  currentY = marginTop;

  let tocHtml = `<div style="padding:10px 0;"><h2 style="text-align:center;font-size:16px;color:#C75B12;margin:0 0 16px;">สารบัญ</h2>`;
  chapters.forEach((ch, i) => {
    tocHtml += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px dotted #ddd;">
      <span style="font-size:10px;color:#2C2417;">${i + 1}. ${escHtml(ch.titleTh)}</span>
      <span style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;font-size:11px;color:#888;">${escHtml(ch.titleAr)}</span>
    </div>`;
  });
  tocHtml += `</div>`;
  const tocImg = await renderBlock(tocHtml);
  pdf.addImage(tocImg.imgData, 'PNG', marginX, currentY, tocImg.wMm, tocImg.hMm);

  // ===== CHAPTERS =====
  const totalSections = chapters.reduce((sum, ch) => sum + ch.sections.length + 1, 0);
  let processedSections = 0;

  for (const chapter of chapters) {
    // Chapter header - always start new page
    pdf.addPage();
    currentY = marginTop;

    const chHeaderHtml = `
      <div style="text-align:center;padding:16px 0;border-top:2px solid #C75B12;border-bottom:2px solid #C75B12;">
        <p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;font-size:20px;font-weight:bold;color:#C75B12;margin:0 0 6px;">${escHtml(chapter.titleAr)}</p>
        <div style="width:60px;height:1.5px;background:linear-gradient(90deg,transparent,#E8A04C,transparent);margin:6px auto;"></div>
        <p style="font-size:14px;font-weight:600;color:#2C2417;margin:6px 0 0;">${escHtml(chapter.titleTh)}</p>
      </div>
    `;
    const chImg = await renderBlock(chHeaderHtml);
    pdf.addImage(chImg.imgData, 'PNG', marginX, currentY, chImg.wMm, chImg.hMm);
    currentY += chImg.hMm + 3;
    processedSections++;
    onProgress?.(10 + Math.round((processedSections / totalSections) * 85));

    // Sections
    for (const section of chapter.sections) {
      let secHtml = '';

      if (section.type === 'quran') {
        secHtml = `<div style="background:#FFF5EB;border-right:3px solid #C75B12;border-radius:0 6px 6px 0;padding:10px 14px;margin:6px 0;">`;
        if (section.reference) {
          secHtml += `<div style="font-size:11px;color:#C75B12;font-weight:600;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #F0D4B0;">📖 ${escHtml(section.reference)}</div>`;
        }
        if (showAr) secHtml += `<p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;text-align:right;font-size:18px;line-height:2.2;color:#1a1a1a;margin:0 0 5px;">${escHtml(section.contentAr)}</p>`;
        if (showTh) secHtml += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${escHtml(section.contentTh)}</p>`;
        secHtml += `</div>`;
      } else if (section.type === 'hadith') {
        secHtml = `<div style="background:#FEF3E2;border-right:3px solid #E8A04C;border-radius:0 6px 6px 0;padding:10px 14px;margin:6px 0;">`;
        if (section.reference) {
          secHtml += `<div style="font-size:11px;color:#E8A04C;font-weight:600;margin-bottom:5px;padding-bottom:4px;border-bottom:1px solid #E8C090;">📜 ${escHtml(section.reference)}</div>`;
        }
        if (showAr) secHtml += `<p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;text-align:right;font-size:16px;line-height:2.2;color:#1a1a1a;margin:0 0 5px;">${escHtml(section.contentAr)}</p>`;
        if (showTh) secHtml += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${escHtml(section.contentTh)}</p>`;
        secHtml += `</div>`;
      } else {
        secHtml = `<div style="margin:6px 0;">`;
        if (section.titleAr && showAr) secHtml += `<p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;text-align:right;font-size:12px;font-weight:bold;color:#2C2417;margin:0 0 3px;">${escHtml(section.titleAr)}</p>`;
        if (section.titleTh && showTh) secHtml += `<p style="font-size:14px;font-weight:600;color:#2C2417;margin:0 0 3px;">${escHtml(section.titleTh)}</p>`;
        if (showAr) secHtml += `<p style="font-family:'Amiri','Traditional Arabic',serif;direction:rtl;text-align:right;font-size:16px;line-height:2.2;color:#2a2a2a;margin:0 0 4px;">${escHtml(section.contentAr)}</p>`;
        if (showTh) secHtml += `<p style="font-size:14px;line-height:1.9;color:#444;margin:0;">${escHtml(section.contentTh)}</p>`;
        if (mode === 'bilingual') secHtml += `<div style="height:1px;background:linear-gradient(90deg,transparent,#E8A04C40,transparent);margin:6px 0;"></div>`;
        secHtml += `</div>`;
      }

      const secImg = await renderBlock(secHtml);

      // If block is taller than usable height, we must split
      if (secImg.hMm > usableH) {
        // For very tall blocks, just add on new page
        addFooter();
        pdf.addPage();
        currentY = marginTop;
        pdf.addImage(secImg.imgData, 'PNG', marginX, currentY, secImg.wMm, secImg.hMm);
        currentY += secImg.hMm + 2;
      } else {
        addPageIfNeeded(secImg.hMm + 2);
        pdf.addImage(secImg.imgData, 'PNG', marginX, currentY, secImg.wMm, secImg.hMm);
        currentY += secImg.hMm + 2;
      }

      processedSections++;
      onProgress?.(10 + Math.round((processedSections / totalSections) * 85));
    }
  }

  // Add footer to last page
  addFooter();

  onProgress?.(98);

  // Save
  const safeName = book.titleEn.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = volumeLabel
    ? `${safeName}_${volumeLabel.replace(/\s/g, '_')}.pdf`
    : `${safeName}.pdf`;

  pdf.save(fileName);
  onProgress?.(100);
}
