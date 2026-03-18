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

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shouldShowAr(type: string, mode: DisplayMode): boolean {
  if (mode === 'arabic' || mode === 'bilingual') return true;
  return type === 'quran' || type === 'hadith';
}
function shouldShowTh(mode: DisplayMode): boolean {
  return mode === 'thai' || mode === 'bilingual';
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

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const marginX = 15;
  const marginTop = 15;
  const marginBot = 20;
  const contentW = pageW - marginX * 2;
  const usableH = pageH - marginTop - marginBot;
  const renderWidthPx = 650;

  const cPrimary = '#C75B12';
  const cAccent = '#E8A04C';
  const cInk = '#2C2417';

  async function renderBlock(html: string): Promise<{ imgData: string; wMm: number; hMm: number }> {
    const container = document.createElement('div');
    container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${renderWidthPx}px;background:white;font-family:'Noto Sans Thai',sans-serif;color:${cInk};padding:8px 16px;`;
    container.innerHTML = html;
    document.body.appendChild(container);
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 150));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await html2canvas(container, { backgroundColor: '#ffffff', logging: false, windowWidth: renderWidthPx } as any);
    const imgData = canvas.toDataURL('image/png');
    const hPx = canvas.height;
    const wPx = canvas.width;
    document.body.removeChild(container);

    const wMm = contentW;
    const hMm = (hPx / wPx) * contentW;
    return { imgData, wMm, hMm };
  }

  let currentY = marginTop;

  function addPageIfNeeded(blockH: number) {
    if (currentY + blockH > pageH - marginBot) {
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
  }

  // ===== COVER =====
  onProgress?.(5);
  const coverHtml = `
    <div style="text-align:center;padding:20px;background:#FDF8F0;">
      <p style="font-family:'Amiri',serif;direction:rtl;font-size:16px;color:${cAccent};margin:0 0 24px;">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
      <div style="border:3px double ${cAccent};padding:8px;display:inline-block;width:88%;">
        <div style="border:1px solid ${cAccent}80;padding:40px 24px;">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:24px;">
            <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,${cAccent});"></div>
            <span style="font-size:12px;color:${cAccent};">✦</span>
            <div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,${cAccent});"></div>
          </div>
          <p style="font-family:'Amiri',serif;direction:rtl;font-size:24px;font-weight:bold;color:${cPrimary};margin:0 0 12px;line-height:1.8;">${escHtml(book.titleAr)}</p>
          <div style="width:80px;height:2px;background:linear-gradient(90deg,transparent,${cAccent},transparent);margin:12px auto;"></div>
          <p style="font-size:18px;font-weight:600;color:${cInk};margin:12px 0 20px;">${escHtml(book.titleTh)}</p>
          <div style="background:${cAccent}15;border-radius:8px;padding:10px 20px;display:inline-block;">
            <p style="font-family:'Amiri',serif;direction:rtl;font-size:13px;color:#666;margin:0 0 4px;">${escHtml(book.authorAr)}</p>
            <p style="font-size:11px;color:#888;margin:0;">${escHtml(book.authorTh)}</p>
          </div>
          ${volumeLabel ? `<div style="margin-top:20px;"><span style="border:2px solid ${cPrimary};border-radius:8px;padding:8px 24px;font-size:15px;font-weight:700;color:${cPrimary};">${escHtml(volumeLabel)}</span></div>` : ''}
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;">
            <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,${cAccent});"></div>
            <span style="font-size:12px;color:${cAccent};">✦</span>
            <div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,${cAccent});"></div>
          </div>
        </div>
      </div>
    </div>`;
  const coverImg = await renderBlock(coverHtml);
  const coverY = Math.max(marginTop, (pageH - coverImg.hMm) / 2);
  pdf.addImage(coverImg.imgData, 'PNG', marginX, coverY, coverImg.wMm, coverImg.hMm);

  // ===== TOC =====
  onProgress?.(10);
  pdf.addPage();
  currentY = marginTop;
  let tocHtml = `<div style="padding:10px 0;">
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="font-size:17px;color:${cPrimary};margin:0 0 6px;">สารบัญ</h2>
      <div style="width:50px;height:1.5px;background:${cAccent};margin:0 auto;"></div>
    </div>`;
  chapters.forEach((ch, i) => {
    tocHtml += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px dotted #ddd;">
      <span style="font-size:12px;color:${cInk};">${i + 1}. ${escHtml(ch.titleTh)}</span>
      <span style="font-family:'Amiri',serif;direction:rtl;font-size:13px;color:#888;">${escHtml(ch.titleAr)}</span>
    </div>`;
  });
  tocHtml += `</div>`;
  const tocImg = await renderBlock(tocHtml);
  pdf.addImage(tocImg.imgData, 'PNG', marginX, currentY, tocImg.wMm, tocImg.hMm);

  // ===== CHAPTERS =====
  const totalSections = chapters.reduce((sum, ch) => sum + ch.sections.length + 1, 0);
  let processedSections = 0;

  for (const chapter of chapters) {
    pdf.addPage();
    currentY = marginTop;

    const chHtml = `
      <div style="text-align:center;padding:16px 0;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
          <div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,${cPrimary});"></div>
          <span style="font-size:10px;color:${cAccent};">✦</span>
          <div style="flex:1;height:2px;background:linear-gradient(270deg,transparent,${cPrimary});"></div>
        </div>
        <p style="font-family:'Amiri',serif;direction:rtl;font-size:20px;font-weight:bold;color:${cPrimary};margin:0 0 6px;">${escHtml(chapter.titleAr)}</p>
        <div style="width:50px;height:1.5px;background:${cAccent};margin:6px auto;"></div>
        <p style="font-size:14px;font-weight:600;color:${cInk};margin:6px 0 0;">${escHtml(chapter.titleTh)}</p>
        <div style="display:flex;align-items:center;gap:6px;margin-top:10px;">
          <div style="flex:1;height:2px;background:linear-gradient(90deg,transparent,${cPrimary});"></div>
          <span style="font-size:10px;color:${cAccent};">✦</span>
          <div style="flex:1;height:2px;background:linear-gradient(270deg,transparent,${cPrimary});"></div>
        </div>
      </div>`;
    const chImg = await renderBlock(chHtml);
    pdf.addImage(chImg.imgData, 'PNG', marginX, currentY, chImg.wMm, chImg.hMm);
    currentY += chImg.hMm + 4;
    processedSections++;
    onProgress?.(10 + Math.round((processedSections / totalSections) * 85));

    for (const section of chapter.sections) {
      let secHtml = '';
      const showAr = shouldShowAr(section.type, mode);
      const showTh = shouldShowTh(mode);

      if (section.type === 'quran') {
        secHtml = `<div style="background:#FFF5EB;border:1px solid #F0D4B0;border-right:4px solid ${cPrimary};border-radius:0 6px 6px 0;padding:14px 18px;margin:8px 0;">`;
        if (section.reference) secHtml += `<div style="font-size:11px;color:${cPrimary};font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #F0D4B0;">﴿ ${escHtml(section.reference)} ﴾</div>`;
        secHtml += `<p style="font-family:'Amiri',serif;direction:rtl;text-align:right;font-size:18px;line-height:2.2;color:#1a1a1a;margin:0 0 8px;font-weight:bold;">${escHtml(section.contentAr)}</p>`;
        secHtml += `<p style="font-size:13px;line-height:1.85;color:#555;margin:0;">${escHtml(section.contentTh)}</p>`;
        secHtml += `</div>`;
      } else if (section.type === 'hadith') {
        secHtml = `<div style="background:#FEF3E2;border:1px solid #E8C090;border-right:4px solid ${cAccent};border-radius:0 6px 6px 0;padding:14px 18px;margin:8px 0;">`;
        if (section.reference) secHtml += `<div style="font-size:11px;color:${cAccent};font-weight:600;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #E8C090;">📜 ${escHtml(section.reference)}</div>`;
        secHtml += `<p style="font-family:'Amiri',serif;direction:rtl;text-align:right;font-size:16px;line-height:2.2;color:#1a1a1a;margin:0 0 8px;">${escHtml(section.contentAr)}</p>`;
        secHtml += `<p style="font-size:13px;line-height:1.85;color:#555;margin:0;">${escHtml(section.contentTh)}</p>`;
        secHtml += `</div>`;
      } else {
        secHtml = `<div style="margin:8px 0;padding-left:12px;border-left:2px solid ${cAccent}30;">`;
        if (section.titleAr && showAr) secHtml += `<p style="font-family:'Amiri',serif;direction:rtl;text-align:right;font-size:14px;font-weight:bold;color:${cInk};margin:0 0 4px;">${escHtml(section.titleAr)}</p>`;
        if (section.titleTh && showTh) secHtml += `<p style="font-size:13px;font-weight:600;color:${cInk};margin:0 0 4px;">${escHtml(section.titleTh)}</p>`;
        if (showAr) secHtml += `<p style="font-family:'Amiri',serif;direction:rtl;text-align:right;font-size:15px;line-height:2.2;color:#2a2a2a;margin:0 0 6px;">${escHtml(section.contentAr)}</p>`;
        if (showTh) secHtml += `<p style="font-size:13px;line-height:1.85;color:#444;margin:0;">${escHtml(section.contentTh)}</p>`;
        secHtml += `</div>`;
        if (mode === 'bilingual') secHtml += `<div style="height:1px;background:linear-gradient(90deg,transparent,${cAccent}40,transparent);margin:8px 0;"></div>`;
      }

      const secImg = await renderBlock(secHtml);
      if (secImg.hMm > usableH) {
        addFooter(); pdf.addPage(); currentY = marginTop;
        pdf.addImage(secImg.imgData, 'PNG', marginX, currentY, secImg.wMm, secImg.hMm);
        currentY += secImg.hMm + 3;
      } else {
        addPageIfNeeded(secImg.hMm + 3);
        pdf.addImage(secImg.imgData, 'PNG', marginX, currentY, secImg.wMm, secImg.hMm);
        currentY += secImg.hMm + 3;
      }
      processedSections++;
      onProgress?.(10 + Math.round((processedSections / totalSections) * 85));
    }
  }

  addFooter();
  onProgress?.(98);

  const safeName = book.titleEn.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = volumeLabel ? `${safeName}_${volumeLabel.replace(/\s/g, '_')}.pdf` : `${safeName}.pdf`;
  pdf.save(fileName);
  onProgress?.(100);
}
