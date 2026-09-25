import { useEffect, useState } from "react";
import { Lesson, Teacher, TimetableConfig, TimetableState } from "@/types/timetable";
import { generateId, getTeacherColor, teachersShareName } from "@/lib/timetable-utils";
import { toast } from "sonner";

const STORAGE_KEY = "weekly-timetable-state-v4";

const emptyState: TimetableState = {
  isConfigured: false,
  config: { daysCount: 5, periodsPerWeek: 40, periodsPerDay: 8, classes: [], breakPeriods: [4], lessonDuration: 45 },
  teachers: [],
  data: {},
};

const keyFor = (dayIndex: number, periodIndex: number, className: string) => `${dayIndex}:${periodIndex}:${className}`;
const teacherCanTeachOn = (teacher: Teacher, dayIndex: number, daysCount: number) => (teacher.availableDays ?? Array.from({ length: daysCount }, (_, index) => index)).includes(dayIndex);
const periodDurationsFor = (config: TimetableConfig) => Array.from(
  { length: config.periodsPerDay },
  (_, index) => config.periodDurations?.[index] ?? config.lessonDuration,
);

export function useTimetable() {
  const [state, setState] = useState<TimetableState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : emptyState;
    } catch { return emptyState; }
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state]);

  const configure = (config: TimetableConfig, teacherEntries: Array<{ name: string; availableDays: number[]; subjects: Array<{ name: string; periodsPerWeek: number; classes: string[] }> }>) => {
    const teachers: Teacher[] = teacherEntries.map((entry, index) => ({
      id: generateId(), name: entry.name.trim(), color: getTeacherColor(index), availableDays: entry.availableDays,
      subjects: entry.subjects.map((subject) => ({ id: generateId(), name: subject.name.trim(), periodsPerWeek: subject.periodsPerWeek, classes: subject.classes })),
    }));
    const data: Record<string, Lesson> = {};
    let unplaced = 0;
    teachers.forEach((teacher) => teacher.subjects.forEach((subject) => subject.classes.forEach((className) => {
      for (let slot = 0; slot < subject.periodsPerWeek; slot += 1) {
        const candidates = Array.from({ length: config.daysCount }, (_, dayIndex) => Array.from({ length: config.periodsPerDay }, (_, index) => ({ dayIndex, periodIndex: index + 1 }))).flat().filter(({ dayIndex, periodIndex }) => teacherCanTeachOn(teacher, dayIndex, config.daysCount) && !config.breakPeriods.includes(periodIndex) && !data[keyFor(dayIndex, periodIndex, className)] && !Object.values(data).some((lesson) => {
          const existingTeacher = teachers.find((item) => item.id === lesson.teacherId);
          return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === dayIndex && lesson.periodIndex === periodIndex;
        }));
        candidates.sort((a, b) => {
          const teacherDayA = Object.values(data).filter((lesson) => { const existingTeacher = teachers.find((item) => item.id === lesson.teacherId); return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === a.dayIndex; }).length;
          const teacherDayB = Object.values(data).filter((lesson) => { const existingTeacher = teachers.find((item) => item.id === lesson.teacherId); return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === b.dayIndex; }).length;
          const subjectDayA = Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id && lesson.dayIndex === a.dayIndex).length;
          const subjectDayB = Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id && lesson.dayIndex === b.dayIndex).length;
          return subjectDayA - subjectDayB || teacherDayA - teacherDayB || a.periodIndex - b.periodIndex;
        });
        const candidate = candidates[0];
        if (!candidate) { unplaced += 1; continue; }
        const key = keyFor(candidate.dayIndex, candidate.periodIndex, className);
        data[key] = { id: generateId(), teacherId: teacher.id, subjectId: subject.id, subject: subject.name, className, dayIndex: candidate.dayIndex, periodIndex: candidate.periodIndex };
      }
    })));
    setState({ isConfigured: true, config: { ...config, periodDurations: periodDurationsFor(config) }, teachers, data });
    if (unplaced) toast.warning(`${unplaced} lesson periods could not be placed because no clash-free slots remained.`);
    else toast.success("Your timetable has been generated automatically.");
  };

  const moveLesson = (fromKey: string, dayIndex: number, periodIndex: number, className: string) => {
    setState((previous) => {
      const lesson = previous.data[fromKey];
      if (!lesson) return previous;
      const destinationKey = keyFor(dayIndex, periodIndex, className);
      if (previous.config.breakPeriods.includes(periodIndex)) {
        toast.error("Lessons cannot be placed during a break.");
        return previous;
      }
      const lessonTeacher = previous.teachers.find((teacher) => teacher.id === lesson.teacherId);
      if (lessonTeacher && !teacherCanTeachOn(lessonTeacher, dayIndex, previous.config.daysCount)) {
        toast.error(`${lessonTeacher.name} is not available on this day.`);
        return previous;
      }
      const conflict = Object.entries(previous.data).some(([key, value]) => {
        const existingTeacher = previous.teachers.find((teacher) => teacher.id === value.teacherId);
        return key !== fromKey && key !== destinationKey && !!lessonTeacher && !!existingTeacher && teachersShareName(existingTeacher.name, lessonTeacher.name) && value.dayIndex === dayIndex && value.periodIndex === periodIndex;
      });
      if (conflict) { toast.error(`${previous.teachers.find((teacher) => teacher.id === lesson.teacherId)?.name} is already teaching then.`); return previous; }
      const nextData = { ...previous.data };
      const destination = nextData[destinationKey];
      const destinationTeacher = destination && previous.teachers.find((teacher) => teacher.id === destination.teacherId);
      if (destination && destinationTeacher && !teacherCanTeachOn(destinationTeacher, dayIndex, previous.config.daysCount)) {
        toast.error(`${destinationTeacher.name} would be unavailable after this swap.`);
        return previous;
      }
      const swapConflict = destination && destinationTeacher && Object.entries(previous.data).some(([key, value]) => {
        const existingTeacher = previous.teachers.find((teacher) => teacher.id === value.teacherId);
        return key !== fromKey && key !== destinationKey && !!existingTeacher && teachersShareName(existingTeacher.name, destinationTeacher.name) && value.dayIndex === lesson.dayIndex && value.periodIndex === lesson.periodIndex;
      });
      if (swapConflict) { toast.error(`${previous.teachers.find((teacher) => teacher.id === destination.teacherId)?.name} would clash after this swap.`); return previous; }
      nextData[destinationKey] = { ...lesson, className, dayIndex, periodIndex };
      if (destination) nextData[fromKey] = { ...destination, className: lesson.className, dayIndex: lesson.dayIndex, periodIndex: lesson.periodIndex };
      else delete nextData[fromKey];
      return { ...previous, data: nextData };
    });
  };

  const addLesson = (teacherId: string, subjectId: string, dayIndex: number, periodIndex: number, className: string) => {
    const teacher = state.teachers.find((item) => item.id === teacherId);
    const subject = teacher?.subjects.find((item) => item.id === subjectId);
    if (!teacher || !subject || state.config.breakPeriods.includes(periodIndex)) return;
    if (!teacherCanTeachOn(teacher, dayIndex, state.config.daysCount)) { toast.error(`${teacher.name} is not available on this day.`); return; }
    const key = keyFor(dayIndex, periodIndex, className);
    const teacherClash = Object.entries(state.data).some(([existingKey, lesson]) => {
      const existingTeacher = state.teachers.find((item) => item.id === lesson.teacherId);
      return existingKey !== key && !!existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === dayIndex && lesson.periodIndex === periodIndex;
    });
    if (teacherClash) { toast.error(`${teacher.name} is already teaching during this period.`); return; }
    const scheduled = Object.values(state.data).filter((lesson) => lesson.teacherId === teacherId && lesson.subjectId === subjectId).length;
    const totalTarget = subject.periodsPerWeek * subject.classes.length;
    if (!subject.classes.includes(className)) { toast.error(`${teacher.name} is not assigned to ${className} for ${subject.name}.`); return; }
    if (scheduled >= totalTarget) { toast.error(`${subject.name} already has all ${totalTarget} assigned weekly periods.`); return; }
    setState((previous) => ({ ...previous, data: { ...previous.data, [key]: { id: generateId(), teacherId, subjectId, subject: subject.name, className, dayIndex, periodIndex } } }));
  };

  const clearTimetable = () => { setState((previous) => ({ ...previous, data: {} })); toast.success("Weekly timetable cleared."); };
  const updatePeriodDuration = (periodIndex: number, duration: number) => {
    if (!Number.isFinite(duration) || duration < 1) return;
    setState((previous) => {
      const durations = periodDurationsFor(previous.config);
      durations[periodIndex - 1] = Math.round(duration);
      return { ...previous, config: { ...previous.config, periodDurations: durations } };
    });
  };
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setState(emptyState); };

  return { state, configure, addLesson, moveLesson, clearTimetable, updatePeriodDuration, reset, keyFor };
}
