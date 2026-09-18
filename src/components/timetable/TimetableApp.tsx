import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useTimetable } from "@/hooks/useTimetable";
import { SetupWizard, type TeacherEntry } from "./SetupWizard";
import { Grid } from "./Grid";
import { useState } from "react";

export function TimetableApp() {
  const timetable = useTimetable();
  const [isEditing, setIsEditing] = useState(false);
  const editTeachers: TeacherEntry[] = timetable.state.teachers.map((teacher) => ({
    name: teacher.name,
    availableDays: teacher.availableDays,
    subjects: teacher.subjects.map((subject) => ({ name: subject.name, periodsPerWeek: subject.periodsPerWeek, classes: subject.classes })),
  }));
  return <main className="min-h-screen bg-slate-50 pb-16">
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-6 w-6" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">School planner</p><h1 className="text-2xl font-black text-slate-900">Weekly Timetable</h1></div>
      </header>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {timetable.state.isConfigured && !isEditing ? <Grid state={timetable.state} addLesson={timetable.addLesson} moveLesson={timetable.moveLesson} clearTimetable={timetable.clearTimetable} updatePeriodDuration={timetable.updatePeriodDuration} reset={timetable.reset} editSetup={() => setIsEditing(true)} keyFor={timetable.keyFor} /> : <SetupWizard initialConfig={timetable.state.isConfigured ? timetable.state.config : undefined} initialTeachers={timetable.state.isConfigured ? editTeachers : undefined} onComplete={(config, teachers) => { timetable.configure(config, teachers); setIsEditing(false); }} />}
      </motion.div>
    </div>
  </main>;
}
