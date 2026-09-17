import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { RotateCcw, Trash2, Clock3, GripVertical } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Lesson, Teacher, TeachingSubject, TimetableState } from "@/types/timetable";
import { toast } from "sonner";

interface GridProps { state: TimetableState; addLesson: (teacherId: string, subjectId: string, day: number, period: number, className: string) => void; moveLesson: (fromKey: string, day: number, period: number, className: string) => void; clearTimetable: () => void; updatePeriodDuration: (period: number, duration: number) => void; reset: () => void; keyFor: (day: number, period: number, className: string) => string; }
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function DraggableSubject({ teacher, subject, scheduled, target }: { teacher: Teacher; subject: TeachingSubject; scheduled: number; target: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `subject:${teacher.id}:${subject.id}`, disabled: scheduled >= target });
  return <div ref={setNodeRef} {...listeners} {...attributes} style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined, backgroundColor: `${teacher.color}55` }} className={`rounded-lg border px-3 py-2 text-left ${scheduled >= target ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing"} ${isDragging ? "opacity-30" : ""}`}><div className="flex items-center gap-1.5 text-xs font-black"><GripVertical className="h-3.5 w-3.5" />{subject.name}</div><div className="mt-0.5 text-[11px] text-slate-600">{teacher.name} · {scheduled}/{target} assigned periods</div></div>;
}
function LessonBlock({ lesson, teacher, id }: { lesson: Lesson; teacher?: Teacher; id: string }) { const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `lesson:${id}`, data: { lessonKey: id } }); return <div ref={setNodeRef} {...attributes} {...listeners} style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined, backgroundColor: teacher?.color || "#e2e8f0" }} className={`h-full min-h-16 cursor-grab rounded-lg px-2 py-2 text-left shadow-sm active:cursor-grabbing ${isDragging ? "opacity-30" : ""}`}><div className="text-xs font-black leading-tight text-slate-900">{lesson.subject}</div><div className="mt-1 text-[10px] font-medium text-slate-700">{teacher?.name}</div></div>; }
function Slot({ id, lesson, teacher, isBreak }: { id: string; lesson?: Lesson; teacher?: Teacher; isBreak: boolean }) { const { isOver, setNodeRef } = useDroppable({ id: `slot:${id}`, data: { slotId: id }, disabled: isBreak }); if (isBreak) return <div data-slot-id={id} className="flex min-h-16 items-center justify-center rounded-lg border border-dashed bg-amber-50 text-[10px] font-bold uppercase tracking-wide text-amber-700">Break</div>; return <div data-slot-id={id} ref={setNodeRef} className={`min-h-16 rounded-lg border p-1 transition-colors ${isOver ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-slate-200 bg-white"}`}>{lesson && <LessonBlock lesson={lesson} teacher={teacher} id={id} />}</div>; }

export function Grid({ state, addLesson, moveLesson, clearTimetable, updatePeriodDuration, reset, keyFor }: GridProps) {
  const { config, teachers, data } = state; const [activeLabel, setActiveLabel] = useState(""); const [isExporting, setIsExporting] = useState(false); const exportRef = useRef<HTMLDivElement>(null); const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const parseSlot = (value: string) => { const [, day, period, ...rest] = value.split(":"); return { day: Number(day), period: Number(period), className: rest.join(":") }; };
  const parseDropTarget = (over: DragEndEvent["over"]) => {
    const slotId = over?.data.current?.slotId;
    return parseSlot(typeof slotId === "string" ? slotId : String(over?.id ?? ""));
  };
  const dragEnd = ({ active, over }: DragEndEvent) => {
    setActiveLabel("");
    if (!over) return;
    const source = String(active.id);
    const destination = parseDropTarget(over);
    if (!Number.isInteger(destination.day) || !Number.isInteger(destination.period) || !destination.className) return;
    if (source.startsWith("subject:")) {
      const [, teacherId, subjectId] = source.split(":");
      addLesson(teacherId, subjectId, destination.day, destination.period, destination.className);
    } else if (source.startsWith("lesson:")) {
      const sourceKey = active.data.current?.lessonKey;
      moveLesson(typeof sourceKey === "string" ? sourceKey : source.slice(7), destination.day, destination.period, destination.className);
    }
  };
  const dragStart = ({ active }: { active: { id: string | number } }) => { const id = String(active.id); const lesson = id.startsWith("lesson:") ? data[id.slice(7)] : undefined; const parts = id.split(":"); const teacher = id.startsWith("subject:") ? teachers.find((item) => item.id === parts[1]) : teachers.find((item) => item.id === lesson?.teacherId); const subject = id.startsWith("subject:") ? teacher?.subjects.find((item) => item.id === parts[2])?.name : lesson?.subject; setActiveLabel(teacher ? `${subject} · ${teacher.name}` : "Lesson"); };
  const exportPdf = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        onclone: (document) => {
          const root = document.documentElement;
          const colors: Record<string, string> = {
            "--background": "#ffffff",
            "--foreground": "#0f172a",
            "--card": "#ffffff",
            "--card-foreground": "#0f172a",
            "--popover": "#ffffff",
            "--popover-foreground": "#0f172a",
            "--primary": "#0f172a",
            "--primary-foreground": "#ffffff",
            "--secondary": "#f1f5f9",
            "--secondary-foreground": "#0f172a",
            "--muted": "#f1f5f9",
            "--muted-foreground": "#64748b",
            "--accent": "#f1f5f9",
            "--accent-foreground": "#0f172a",
            "--border": "#e2e8f0",
            "--input": "#e2e8f0",
            "--ring": "#94a3b8",
            "--destructive": "#dc2626",
            "--destructive-foreground": "#ffffff",
            "--chart-1": "#93c5fd",
            "--chart-2": "#60a5fa",
            "--chart-3": "#3b82f6",
            "--chart-4": "#2563eb",
            "--chart-5": "#1d4ed8",
            "--sidebar": "#ffffff",
            "--sidebar-foreground": "#0f172a",
            "--sidebar-primary": "#0f172a",
            "--sidebar-primary-foreground": "#ffffff",
            "--sidebar-accent": "#f1f5f9",
            "--sidebar-accent-foreground": "#0f172a",
            "--sidebar-border": "#e2e8f0",
            "--sidebar-ring": "#94a3b8",
            "--shadow-color": "#000000",
          };
          Object.entries(colors).forEach(([name, value]) => root.style.setProperty(name, value));
          document.querySelectorAll<HTMLElement>("*").forEach((element) => {
            const computed = document.defaultView?.getComputedStyle(element);
            if (!computed) return;
            const colorProperties = ["color", "backgroundColor", "borderColor", "outlineColor", "textDecorationColor", "columnRuleColor", "caretColor"];
            colorProperties.forEach((property) => {
              const value = computed[property as keyof CSSStyleDeclaration];
              if (typeof value === "string" && value.includes("oklch")) {
                element.style[property as "color"] = property === "backgroundColor" ? "transparent" : "#334155";
              }
            });
            if (computed.boxShadow.includes("oklch")) element.style.boxShadow = "none";
          });
        },
      });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
      const margin = 10;
      const pageWidth = 420 - margin * 2;
      const pageHeight = 297 - margin * 2;
      const scale = Math.min(pageWidth / canvas.width, (pageHeight - 8) / canvas.height);
      const renderWidth = canvas.width * scale;
      const renderHeight = canvas.height * scale;
      pdf.setFontSize(14);
      pdf.text("Weekly Timetable", margin, 8);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", (420 - renderWidth) / 2, 14, renderWidth, renderHeight);
      pdf.save("weekly-timetable-a3.pdf");
      toast.success("Timetable PDF downloaded.");
    } catch (error) {
      console.error("Failed to export timetable PDF.", error);
      toast.error("Unable to export the timetable PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  const periodDurations = Array.from({ length: config.periodsPerDay }, (_, index) => config.periodDurations?.[index] ?? config.lessonDuration);
  return <div className="space-y-5"><section className="flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-5 text-white md:flex-row md:items-center"><div><h2 className="text-xl font-black">Your weekly schedule</h2><p className="mt-1 text-sm text-slate-300"><Clock3 className="mr-1 inline h-4 w-4" />Manual duration per period · no teacher clashes permitted</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={exportPdf} disabled={isExporting}>{isExporting ? "Creating PDF..." : "Export A3 PDF"}</Button><Button variant="secondary" size="sm" onClick={clearTimetable}><Trash2 className="mr-1 h-4 w-4" /> Clear lessons</Button><Button variant="outline" size="sm" className="border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={reset}><RotateCcw className="mr-1 h-4 w-4" /> Start over</Button></div></section><section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-3"><h3 className="font-bold">Colour-coded subject blocks</h3><p className="text-sm text-muted-foreground">Each colour is a teacher. Weekly allowances and teacher availability are enforced on every drop or swap.</p></div><DndContext sensors={sensors} onDragStart={dragStart} onDragEnd={dragEnd}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{teachers.flatMap((teacher) => teacher.subjects.map((subject) => <DraggableSubject key={subject.id} teacher={teacher} subject={subject} scheduled={Object.values(data).filter((lesson) => lesson.teacherId === teacher.id && lesson.subjectId === subject.id).length} target={subject.periodsPerWeek * subject.classes.length} />))}</div><div ref={exportRef} className="mt-5 overflow-x-auto rounded-xl border bg-white"><div className="min-w-[1000px]"><div className="grid border-b bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div className="p-3">Day</div><div className="border-l p-3">Class</div>{Array.from({ length: config.periodsPerDay }, (_, index) => <div key={index} className="border-l p-3 text-center">{config.breakPeriods.includes(index + 1) ? "Break" : `Period ${index + 1}`}</div>)}</div><div className="grid border-b bg-white text-[10px] text-slate-500" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div /><div className="border-l p-2 font-bold">Minutes</div>{periodDurations.map((duration, index) => <label key={index} className="border-l p-1.5"><input aria-label={`Duration for period ${index + 1}`} className="w-full rounded border bg-white px-2 py-1 text-center text-xs font-bold text-slate-700" type="number" min="1" value={duration} onChange={(event) => updatePeriodDuration(index + 1, Number(event.target.value))} /></label>)}</div>{Array.from({ length: config.daysCount }, (_, dayIndex) => <div key={dayIndex} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `112px 115px repeat(${config.periodsPerDay}, minmax(120px, 1fr))` }}><div className="flex items-center justify-center border-r bg-slate-50 px-3 text-center text-sm font-black text-slate-700" style={{ gridRow: `span ${config.classes.length}` }}>{days[dayIndex]}</div>{config.classes.map((className) => <div key={`${dayIndex}-${className}`} className="contents"><div className="flex min-h-[76px] items-center border-r px-3 text-sm font-bold text-slate-700">{className}</div>{Array.from({ length: config.periodsPerDay }, (_, i) => { const period = i + 1; const id = keyFor(dayIndex, period, className); const lesson = data[id]; return <div key={id} className="border-r p-1.5"><Slot id={id} lesson={lesson} teacher={teachers.find((teacher) => teacher.id === lesson?.teacherId)} isBreak={config.breakPeriods.includes(period)} /></div>; })}</div>)}</div>)}</div></div><DragOverlay><div className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xl">{activeLabel}</div></DragOverlay></DndContext></section></div>;
}
