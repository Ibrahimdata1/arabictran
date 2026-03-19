export interface BookSummary {
  slug: string;
  titleAr: string;
  titleTh: string;
  authorAr: string;
  authorTh: string;
  editorTh: string;
  description: string;
  totalTopics: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  number: number;
  titleTh: string;
  titleAr?: string;
  // Summary from the book (สรุปจากเล่ม)
  summary: string;
  // Analysis (บทวิเคราะห์)
  analysis: string;
  // Evidence references
  references: Reference[];
  // Subtopics
  subtopics: SubTopic[];
  // Page in original book
  page?: string;
}

export interface SubTopic {
  id: string;
  titleTh: string;
  summary: string;
  analysis: string;
  references: Reference[];
}

export interface Reference {
  type: 'quran' | 'hadith' | 'athar' | 'scholar';
  textAr: string;
  textTh: string;
  source: string; // e.g., "สูเราะฮ์ อัล-หัชร์ 59:2" or "เศาะฮีห์ บุคอรีย์ 7352"
  url?: string; // link to quran.com or sunnah.com
}

export interface ReadProgress {
  [topicId: string]: boolean;
}
