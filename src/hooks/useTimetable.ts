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
const createsTriple = (data: Record<string, Lesson>, lesson: Lesson, periodsPerDay: number) => [lesson.periodIndex - 2, lesson.periodIndex - 1, lesson.periodIndex].some((start) => {
  if (start < 1 || start + 2 > periodsPerDay) return false;
  return [start, start + 1, start + 2].every((period) => {
    const adjacent = data[keyFor(lesson.dayIndex, period, lesson.className)];
    return adjacent?.teacherId === lesson.teacherId && adjacent.subjectId === lesson.subjectId;
  });
});

export function useTimetable() {
  const [state, setState] = useState<TimetableState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : emptyState;
    } catch { return emptyState; }
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state]);

  const configure = (config: TimetableConfig, teacherEntries: Array<{ name: string; availableDays: number[]; subjects: Array<{ name: string; periodsPerWeek: number; classes: string[]; doublePeriodClass?: string }> }>) => {
    const teachers: Teacher[] = teacherEntries.map((entry, index) => ({
      id: generateId(), name: entry.name.trim(), color: getTeacherColor(index), availableDays: entry.availableDays,
      subjects: entry.subjects.map((subject) => ({ id: generateId(), name: subject.name.trim(), periodsPerWeek: subject.periodsPerWeek, classes: subject.classes, doublePeriodClass: subject.classes.includes(subject.doublePeriodClass ?? "") ? subject.doublePeriodClass : undefined })),
    }));
    const data: Record<string, Lesson> = {};
    let unplaced = 0;
    teachers.forEach((teacher) => teacher.subjects.forEach((subject) => subject.classes.forEach((className) => {
      const isSameSubjectAt = (dayIndex: number, periodIndex: number) => {
        const lesson = data[keyFor(dayIndex, periodIndex, className)];
        return lesson?.teacherId === teacher.id && lesson.subjectId === subject.id;
      };
      const wouldCreateTriple = (dayIndex: number, periodIndex: number) => {
        const subjectAt = (period: number) => period === periodIndex || isSameSubjectAt(dayIndex, period);
        return [periodIndex - 2, periodIndex - 1, periodIndex].some((start) => subjectAt(start) && subjectAt(start + 1) && subjectAt(start + 2));
      };
      const canPlace = (dayIndex: number, periodIndex: number) => teacherCanTeachOn(teacher, dayIndex, config.daysCount)
        && periodIndex >= 1
        && periodIndex <= config.periodsPerDay
        && !config.breakPeriods.includes(periodIndex)
        && !data[keyFor(dayIndex, periodIndex, className)]
        && !wouldCreateTriple(dayIndex, periodIndex)
        && !Object.values(data).some((lesson) => {
          const existingTeacher = teachers.find((item) => item.id === lesson.teacherId);
          return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === dayIndex && lesson.periodIndex === periodIndex;
        });
      const sortCandidates = (candidates: Array<{ dayIndex: number; periodIndex: number }>) => candidates.sort((a, b) => {
        const teacherDayA = Object.values(data).filter((lesson) => { const existingTeacher = teachers.find((item) => item.id === lesson.teacherId); return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === a.dayIndex; }).length;
        const teacherDayB = Object.values(data).filter((lesson) => { const existingTeacher = teachers.find((item) => item.id === lesson.teacherId); return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === b.dayIndex; }).length;
        const subjectDayA = Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id && lesson.dayIndex === a.dayIndex).length;
        const subjectDayB = Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id && lesson.dayIndex === b.dayIndex).length;
        return subjectDayA - subjectDayB || teacherDayA - teacherDayB || a.periodIndex - b.periodIndex;
      });
      const placeLesson = (dayIndex: number, periodIndex: number) => {
        data[keyFor(dayIndex, periodIndex, className)] = { id: generateId(), teacherId: teacher.id, subjectId: subject.id, subject: subject.name, className, dayIndex, periodIndex };
      };
      let slot = 0;
      while (slot < subject.periodsPerWeek) {
        const needsPair = subject.doublePeriodClass === className && subject.periodsPerWeek - slot >= 2;
        if (needsPair) {
          const pairs = sortCandidates(Array.from({ length: config.daysCount }, (_, dayIndex) => Array.from({ length: Math.max(0, config.periodsPerDay - 1) }, (_, index) => ({ dayIndex, periodIndex: index + 1 }))).flat().filter(({ dayIndex, periodIndex }) => {
            const nextPeriod = periodIndex + 1;
            return canPlace(dayIndex, periodIndex)
              && teacherCanTeachOn(teacher, dayIndex, config.daysCount)
              && !config.breakPeriods.includes(nextPeriod)
              && !data[keyFor(dayIndex, nextPeriod, className)]
              && !Object.values(data).some((lesson) => {
                const existingTeacher = teachers.find((item) => item.id === lesson.teacherId);
                return existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === dayIndex && lesson.periodIndex === nextPeriod;
              })
              && !isSameSubjectAt(dayIndex, periodIndex - 1)
              && !isSameSubjectAt(dayIndex, periodIndex + 2);
          }));
          const pair = pairs[0];
          if (pair) {
            placeLesson(pair.dayIndex, pair.periodIndex);
            placeLesson(pair.dayIndex, pair.periodIndex + 1);
            slot += 2;
            continue;
          }
        }
        const candidates = sortCandidates(Array.from({ length: config.daysCount }, (_, dayIndex) => Array.from({ length: config.periodsPerDay }, (_, index) => ({ dayIndex, periodIndex: index + 1 }))).flat().filter(({ dayIndex, periodIndex }) => canPlace(dayIndex, periodIndex)));
        const candidate = candidates[0];
        if (!candidate) { unplaced += subject.periodsPerWeek - slot; break; }
        placeLesson(candidate.dayIndex, candidate.periodIndex);
        slot += 1;
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
      if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= previous.config.daysCount || !Number.isInteger(periodIndex) || periodIndex < 1 || periodIndex > previous.config.periodsPerDay) {
        toast.error("Choose a valid timetable slot.");
        return previous;
      }
      if (previous.config.breakPeriods.includes(periodIndex)) {
        toast.error("Lessons cannot be placed during a break.");
        return previous;
      }
      const lessonTeacher = previous.teachers.find((teacher) => teacher.id === lesson.teacherId);
      const lessonSubject = lessonTeacher?.subjects.find((subject) => subject.id === lesson.subjectId);
      if (lessonSubject && !lessonSubject.classes.includes(className)) {
        toast.error(`${lesson.subject} is not assigned to ${className}.`);
        return previous;
      }
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
      const destinationSubject = destination && destinationTeacher?.subjects.find((subject) => subject.id === destination.subjectId);
      if (destination && destinationTeacher && !teacherCanTeachOn(destinationTeacher, dayIndex, previous.config.daysCount)) {
        toast.error(`${destinationTeacher.name} would be unavailable after this swap.`);
        return previous;
      }
      if (destination && destinationSubject && !destinationSubject.classes.includes(lesson.className)) {
        toast.error(`${destination.subject} is not assigned to ${lesson.className}.`);
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
      if (createsTriple(nextData, nextData[destinationKey], previous.config.periodsPerDay) || (destination && createsTriple(nextData, nextData[fromKey], previous.config.periodsPerDay))) {
        toast.error("A subject can have at most two consecutive periods.");
        return previous;
      }
      toast.success(destination ? "Lessons swapped successfully." : "Lesson moved successfully.");
      return { ...previous, data: nextData };
    });
  };

  const addLesson = (teacherId: string, subjectId: string, dayIndex: number, periodIndex: number, className: string) => {
    const teacher = state.teachers.find((item) => item.id === teacherId);
    const subject = teacher?.subjects.find((item) => item.id === subjectId);
    if (!teacher || !subject || state.config.breakPeriods.includes(periodIndex)) return;
    if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= state.config.daysCount || !Number.isInteger(periodIndex) || periodIndex < 1 || periodIndex > state.config.periodsPerDay) { toast.error("Choose a valid timetable slot."); return; }
    if (!teacherCanTeachOn(teacher, dayIndex, state.config.daysCount)) { toast.error(`${teacher.name} is not available on this day.`); return; }
    const key = keyFor(dayIndex, periodIndex, className);
    if (state.data[key]) { toast.error("That class period is occupied. Select a lesson to move or swap it."); return; }
    const teacherClash = Object.entries(state.data).some(([existingKey, lesson]) => {
      const existingTeacher = state.teachers.find((item) => item.id === lesson.teacherId);
      return existingKey !== key && !!existingTeacher && teachersShareName(existingTeacher.name, teacher.name) && lesson.dayIndex === dayIndex && lesson.periodIndex === periodIndex;
    });
    if (teacherClash) { toast.error(`${teacher.name} is already teaching during this period.`); return; }
    const scheduled = Object.values(state.data).filter((lesson) => lesson.teacherId === teacherId && lesson.subjectId === subjectId).length;
    const totalTarget = subject.periodsPerWeek * subject.classes.length;
    if (!subject.classes.includes(className)) { toast.error(`${teacher.name} is not assigned to ${className} for ${subject.name}.`); return; }
    if (scheduled >= totalTarget) { toast.error(`${subject.name} already has all ${totalTarget} assigned weekly periods.`); return; }
    const lesson: Lesson = { id: generateId(), teacherId, subjectId, subject: subject.name, className, dayIndex, periodIndex };
    const nextData = { ...state.data, [key]: lesson };
    if (createsTriple(nextData, lesson, state.config.periodsPerDay)) { toast.error("A subject can have at most two consecutive periods."); return; }
    setState((previous) => ({ ...previous, data: { ...previous.data, [key]: lesson } }));
    toast.success(`${subject.name} added successfully.`);
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
