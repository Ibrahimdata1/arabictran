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

// Open print page in new window — browser renders Arabic perfectly
export function openPrintPage(bookId: string, mode: DisplayMode, vol?: number): void {
  const params = new URLSearchParams({ mode });
  if (vol !== undefined) params.set('vol', String(vol));
  params.set('autoprint', '1');
  const url = `/print/${bookId}?${params.toString()}`;
  window.open(url, '_blank');
}
