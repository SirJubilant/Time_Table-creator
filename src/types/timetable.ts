export interface TeachingSubject {
  id: string;
  name: string;
  periodsPerWeek: number;
  classes: string[];
}

export interface Teacher {
  id: string;
  name: string;
  color: string;
  /** Weekday indexes on which this teacher may be scheduled. */
  availableDays: number[];
  subjects: TeachingSubject[];
}

/** @deprecated The weekly planner no longer needs modes. Kept for upgrade compatibility. */
export type TimetableMode = "study" | "class" | "school";

/** @deprecated Replaced by Lesson. Kept for compatibility with legacy Cell.tsx. */
export interface PeriodData {
  id: string;
  subject: string;
  teacherId: string;
  className: string;
  isBreak: boolean;
  dayIndex: number;
  periodIndex: number;
}

export interface Lesson {
  id: string;
  teacherId: string;
  subjectId: string;
  subject: string;
  className: string;
  dayIndex: number;
  periodIndex: number;
}

export interface TimetableConfig {
  daysCount: number;
  periodsPerWeek: number;
  periodsPerDay: number;
  classes: string[];
  breakPeriods: number[];
  lessonDuration: number;
  periodDurations?: number[];
  /** @deprecated Legacy setting, ignored by the weekly planner. */
  mode?: TimetableMode;
  /** @deprecated Use periodsPerDay. */
  periodsCount?: number;
}

export interface TimetableState {
  isConfigured: boolean;
  config: TimetableConfig;
  teachers: Teacher[];
  data: Record<string, Lesson>;
}
