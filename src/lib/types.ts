export interface Book {
  id: string;
  titleAr: string;
  titleTh: string;
  titleEn: string;
  authorAr: string;
  authorTh: string;
  description: string;
  coverColor: string;
  totalChapters: number;
  chapters: Chapter[];
  hasPdf?: boolean;
}

export interface Chapter {
  id: string;
  number: number;
  titleAr: string;
  titleTh: string;
  sections: Section[];
}

export interface Section {
  id: string;
  titleAr?: string;
  titleTh?: string;
  contentAr: string;
  contentTh: string;
  type: 'text' | 'quran' | 'hadith';
  reference?: string; // e.g., "Al-Fatiha 1:1-7" or "Sahih Bukhari 1"
}

export type DisplayMode = 'arabic' | 'bilingual' | 'thai';

export interface ReadingProgress {
  bookId: string;
  chapterId: string;
  sectionId: string;
  scrollPosition: number;
  lastRead: number; // timestamp
}

export interface UserProfile {
  id: string;
  readingProgress: Record<string, ReadingProgress>;
}
