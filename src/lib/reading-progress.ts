'use client';

import { ReadingProgress } from './types';

const STORAGE_KEY = 'arabictran_progress';
const USER_ID_KEY = 'arabictran_user_id';

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateUserId();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getProgress(bookId: string): ReadingProgress | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  const all: Record<string, ReadingProgress> = JSON.parse(data);
  return all[bookId] || null;
}

export function getAllProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return {};
  return JSON.parse(data);
}

export function saveProgress(progress: ReadingProgress): void {
  if (typeof window === 'undefined') return;
  const all = getAllProgress();
  all[progress.bookId] = { ...progress, lastRead: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getReadingPercentage(bookId: string, totalChapters: number): number {
  const progress = getProgress(bookId);
  if (!progress) return 0;
  // Simple percentage based on chapter position
  const chapterNum = parseInt(progress.chapterId.split('-').pop() || '0');
  return Math.round((chapterNum / totalChapters) * 100);
}
