import { useEffect, useRef, useState } from "react";
import { Clock3, Pencil, Printer, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lesson, Teacher, TeachingSubject, TimetableState } from "@/types/timetable";
import { toast } from "sonner";

interface GridProps {
  state: TimetableState;
  addLesson: (teacherId: string, subjectId: string, day: number, period: number, className: string) => void;
  moveLesson: (fromKey: string, day: number, period: number, className: string) => void;
  clearTimetable: () => void;
  updatePeriodDuration: (period: number, duration: number) => void;
  reset: () => void;
  editSetup: () => void;
  keyFor: (day: number, period: number, className: string) => string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type Selection = { kind: "lesson"; key: string } | { kind: "subject"; teacherId: string; subjectId: string };

function SubjectOption({ teacher, subject, scheduled, selected, onSelect }: {
  teacher: Teacher;
  subject: TeachingSubject;
  scheduled: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const target = subject.periodsPerWeek * subject.classes.length;
  return <button type="button" disabled={scheduled >= target} onClick={onSelect} aria-pressed={selected}
    style={{ backgroundColor: `${teacher.color}55` }}
    className={`rounded-lg border px-3 py-2 text-left transition ${selected ? "border-primary ring-2 ring-primary/30" : "border-slate-200 hover:border-primary/50"} ${scheduled >= target ? "cursor-not-allowed opacity-50" : ""}`}>
    <span className="block text-xs font-black">{subject.name}</span>
    <span className="mt-0.5 block text-[11px] text-slate-600">{teacher.name} · {scheduled}/{target} assigned</span>
    {subject.doublePeriodClass && <span className="mt-0.5 block text-[10px] font-semibold text-slate-600">Double periods: {subject.doublePeriodClass}</span>}
  </button>;
}

function Slot({ id, lesson, teacher, isBreak, selected, canReceive, onClick }: {
  id: string;
  lesson?: Lesson;
  teacher?: Teacher;
  isBreak: boolean;
  selected: boolean;
  canReceive: boolean;
  onClick: () => void;
}) {
  if (isBreak) return <div data-slot-id={id} className="flex min-h-16 items-center justify-center rounded-lg border border-dashed bg-amber-50 text-[10px] font-bold uppercase tracking-wide text-amber-700">Break</div>;
  return <button type="button" data-slot-id={id} onClick={onClick} aria-label={lesson ? `${lesson.subject}, ${teacher?.name ?? "teacher"}. Select or swap lesson` : "Empty period. Place selected lesson here"}
    style={lesson ? { backgroundColor: teacher?.color || "#e2e8f0" } : undefined}
    className={`min-h-16 w-full rounded-lg border p-1 text-left transition ${selected ? "border-primary ring-2 ring-primary/40" : canReceive ? "border-primary/50 bg-primary/5 hover:bg-primary/10" : "border-slate-200 bg-white hover:border-slate-400"}`}>
    {lesson ? <span className="block min-h-14 rounded-md px-2 py-2 shadow-sm">
      <span className="block text-xs font-black leading-tight text-slate-900">{lesson.subject}</span>
      <span className="mt-1 block text-[10px] font-medium text-slate-700">{teacher?.name}</span>
    </span> : <span className="block min-h-14" />}
  </button>;
}

export function Grid({ state, addLesson, moveLesson, clearTimetable, updatePeriodDuration, reset, editSetup, keyFor }: GridProps) {
  const { config, teachers, data } = state;
  const [selection, setSelection] = useState<Selection | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState({ contentWidth: 0, tableWidth: 0, viewportWidth: 0 });
  const timetableScrollRef = useRef<HTMLDivElement>(null);
  const floatingScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);
  const periodDurations = Array.from({ length: config.periodsPerDay }, (_, index) => config.periodDurations?.[index] ?? config.lessonDuration);
  const selectedLesson = selection?.kind === "lesson" ? data[selection.key] : undefined;
  const selectionLabel = selection?.kind === "subject"
    ? teachers.find((teacher) => teacher.id === selection.teacherId)?.subjects.find((subject) => subject.id === selection.subjectId)?.name
    : selectedLesson?.subject;

  const onSlotClick = (day: number, period: number, className: string) => {
    const targetKey = keyFor(day, period, className);
    const destination = data[targetKey];
    if (!selection) {
      if (destination) setSelection({ kind: "lesson", key: targetKey });
      return;
    }
    if (selection.kind === "subject") {
      const teacher = teachers.find((item) => item.id === selection.teacherId);
      const subject = teacher?.subjects.find((item) => item.id === selection.subjectId);
      if (subject && !subject.classes.includes(className)) {
        toast.error(`${subject.name} is not assigned to ${className}.`);
        return;
      }
      if (destination) {
        toast.error("That period is occupied. Choose an empty slot, or select a scheduled lesson first to swap it.");
        return;
      }
      addLesson(selection.teacherId, selection.subjectId, day, period, className);
      setSelection(null);
      return;
    }
    if (targetKey === selection.key) {
      setSelection(null);
      return;
    }
    if (destination) {
      setSelection({ kind: "lesson", key: targetKey });
      moveLesson(selection.key, day, period, className);
      return;
    }
    moveLesson(selection.key, day, period, className);
    setSelection(null);
  };

  useEffect(() => {
    const table = timetableScrollRef.current;
    if (!table) return;

    const updateScrollMetrics = () => {
      setScrollMetrics({
        contentWidth: table.scrollWidth,
        tableWidth: table.clientWidth,
        viewportWidth: document.documentElement.clientWidth,
      });
    };

    updateScrollMetrics();
    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(table);
    if (table.firstElementChild) resizeObserver.observe(table.firstElementChild);
    window.addEventListener("resize", updateScrollMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, [config.daysCount, config.periodsPerDay, config.classes.length]);

  const syncHorizontalScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
    if (!source || !target || isSyncingScroll.current) return;
    const sourceMax = source.scrollWidth - source.clientWidth;
    const targetMax = target.scrollWidth - target.clientWidth;
    isSyncingScroll.current = true;
    target.scrollLeft = sourceMax > 0 ? (source.scrollLeft / sourceMax) * targetMax : 0;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const printTimetable = () => window.print();
  const floatingContentWidth = Math.max(
    scrollMetrics.viewportWidth,
    scrollMetrics.contentWidth + scrollMetrics.viewportWidth - scrollMetrics.tableWidth,
  );
  return <div className="timetable-app space-y-5">
    <section className="print-controls flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-5 text-white md:flex-row md:items-center">
      <div><h2 className="text-xl font-black">Your weekly schedule</h2><p className="mt-1 text-sm text-slate-300"><Clock3 className="mr-1 inline h-4 w-4" />Manual duration per period · no teacher clashes permitted</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={printTimetable}><Printer className="mr-1 h-4 w-4" /> Print A3 timetable</Button><Button variant="secondary" size="sm" onClick={clearTimetable}><Trash2 className="mr-1 h-4 w-4" /> Clear lessons</Button><Button variant="outline" size="sm" className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={editSetup}><Pencil className="mr-1 h-4 w-4" /> Edit inputs</Button><Button variant="outline" size="sm" className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={reset}><RotateCcw className="mr-1 h-4 w-4" /> Start over</Button></div>
    </section>
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="print-controls mb-3"><h3 className="font-bold">Select a lesson, then choose its destination</h3><p className="text-sm text-muted-foreground">Choose a scheduled lesson to move it, or choose a subject to add an unassigned period. Select another lesson to swap positions. Invalid moves are rejected with an explanation.</p></div>
      <div className="print-controls grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{teachers.flatMap((teacher) => teacher.subjects.map((subject) => <SubjectOption key={subject.id} teacher={teacher} subject={subject} scheduled={Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id).length} selected={selection?.kind === "subject" && selection.teacherId === teacher.id && selection.subjectId === subject.id} onSelect={() => setSelection((current) => current?.kind === "subject" && current.subjectId === subject.id ? null : { kind: "subject", teacherId: teacher.id, subjectId: subject.id })} />))}</div>
      {selection && <div className="print-controls mt-3 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm" role="status"><span>Selected: <strong>{selectionLabel ?? "lesson"}</strong>. Click an empty slot to move/add, or another lesson to swap.</span><Button type="button" variant="ghost" size="sm" aria-label="Cancel selection" onClick={() => setSelection(null)}><X className="h-4 w-4" /> Cancel</Button></div>}
      <div ref={timetableScrollRef} onScroll={(event) => syncHorizontalScroll(event.currentTarget, floatingScrollRef.current)} className="timetable-scroll mt-5 overflow-x-auto rounded-xl border bg-white"><div className="timetable-print min-w-[1000px]">
        <div className="grid border-b bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div className="sticky left-0 z-20 bg-slate-100 p-3 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.2)]">Day</div><div className="sticky left-[112px] z-20 border-l bg-slate-100 p-3 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.2)]">Class</div>{Array.from({ length: config.periodsPerDay }, (_, index) => <div key={index} className="border-l p-3 text-center">{config.breakPeriods.includes(index + 1) ? "Break" : `Period ${index + 1}`}</div>)}</div>
        <div className="grid border-b bg-white text-[10px] text-slate-500" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div className="sticky left-0 z-10 bg-white" /><div className="sticky left-[112px] z-10 border-l bg-white p-2 font-bold shadow-[4px_0_8px_-4px_rgba(15,23,42,0.2)]">Minutes</div>{periodDurations.map((duration, index) => <label key={index} className="border-l p-1.5"><input aria-label={`Duration for period ${index + 1}`} className="w-full rounded border bg-white px-2 py-1 text-center text-xs font-bold text-slate-700" type="number" min="1" value={duration} onChange={(event) => updatePeriodDuration(index + 1, Number(event.target.value))} /></label>)}</div>
        {Array.from({ length: config.daysCount }, (_, dayIndex) => <div key={dayIndex} className="timetable-day grid border-b last:border-b-0" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div className="sticky left-0 z-10 flex items-center justify-center border-r bg-slate-50 px-3 text-center text-sm font-black text-slate-700 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.2)]" style={{ gridRow: `span ${config.classes.length}` }}>{days[dayIndex]}</div>{config.classes.map((className) => <div key={`${dayIndex}-${className}`} className="contents"><div className="sticky left-[112px] z-10 flex min-h-[76px] items-center border-r bg-white px-3 text-sm font-bold text-slate-700 shadow-[4px_0_8px_-4px_rgba(15,23,42,0.2)]">{className}</div>{Array.from({ length: config.periodsPerDay }, (_, i) => { const period = i + 1; const id = keyFor(dayIndex, period, className); const lesson = data[id]; const isSelected = selection?.kind === "lesson" && selection.key === id; const canReceive = !!selection && (!lesson || selection.kind === "lesson"); return <div key={id} className="border-r p-1.5"><Slot id={id} lesson={lesson} teacher={teachers.find((teacher) => teacher.id === lesson?.teacherId)} isBreak={config.breakPeriods.includes(period)} selected={isSelected} canReceive={canReceive} onClick={() => onSlotClick(dayIndex, period, className)} /></div>; })}</div>)}</div>)}
      </div></div>
    </section>
    {scrollMetrics.contentWidth > scrollMetrics.tableWidth && <div ref={floatingScrollRef} onScroll={(event) => syncHorizontalScroll(event.currentTarget, timetableScrollRef.current)} className="print-controls fixed inset-x-0 bottom-0 z-50 h-5 overflow-x-auto overflow-y-hidden border-t bg-white/95 shadow-[0_-2px_8px_rgba(15,23,42,0.12)]" role="region" aria-label="Scroll timetable horizontally" tabIndex={0}><div style={{ width: floatingContentWidth }} className="h-1" /></div>}
  </div>;
}
