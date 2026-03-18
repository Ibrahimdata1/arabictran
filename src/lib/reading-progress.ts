'use client';

import { ReadingProgress } from './types';

const STORAGE_PREFIX = 'arabictran_progress';

// Get storage key — if user email provided, use email-based key for cross-device sync
function getStorageKey(userEmail?: string | null): string {
  if (userEmail) {
    return `${STORAGE_PREFIX}_${userEmail}`;
  }
  return STORAGE_PREFIX;
}

export function getProgress(bookId: string, userEmail?: string | null): ReadingProgress | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(getStorageKey(userEmail));
  if (!data) return null;
  const all: Record<string, ReadingProgress> = JSON.parse(data);
  return all[bookId] || null;
}

export function getAllProgress(userEmail?: string | null): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(getStorageKey(userEmail));
  if (!data) return {};
  return JSON.parse(data);
}

export function saveProgress(progress: ReadingProgress, userEmail?: string | null): void {
  if (typeof window === 'undefined') return;
  const key = getStorageKey(userEmail);
  const all = getAllProgress(userEmail);
  all[progress.bookId] = { ...progress, lastRead: Date.now() };
  localStorage.setItem(key, JSON.stringify(all));
}

export function getReadingPercentage(bookId: string, totalChapters: number, userEmail?: string | null): number {
  const progress = getProgress(bookId, userEmail);
  if (!progress) return 0;
  const chapterNum = parseInt(progress.chapterId.split('-').pop() || '0');
  return Math.round((chapterNum / totalChapters) * 100);
}

// Migrate anonymous progress to user account on first login
export function migrateProgress(userEmail: string): void {
  if (typeof window === 'undefined') return;
  const anonData = localStorage.getItem(STORAGE_PREFIX);
  if (!anonData) return;

  const userKey = getStorageKey(userEmail);
  const existing = localStorage.getItem(userKey);

  if (!existing) {
    // First login — copy anonymous progress to user account
    localStorage.setItem(userKey, anonData);
  }
}
