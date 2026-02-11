
export interface ScrapbookEntry {
  id: string;
  date: string; // ISO string
  imageUrl: string;
  tags: string[];
  note?: string;
}

export interface WeeklyData {
  weekStart: string; // ISO string of Monday
  entries: ScrapbookEntry[];
  generalNote: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Weekend';
