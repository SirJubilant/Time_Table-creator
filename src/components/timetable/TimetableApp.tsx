import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useTimetable } from "@/hooks/useTimetable";
import { SetupWizard } from "./SetupWizard";
import { Grid } from "./Grid";

export function TimetableApp() {
  const timetable = useTimetable();
  return <main className="min-h-screen bg-slate-50 pb-16">
    <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">
      <header className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-6 w-6" /></div>
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">School planner</p><h1 className="text-2xl font-black text-slate-900">Weekly Timetable</h1></div>
      </header>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {timetable.state.isConfigured ? <Grid state={timetable.state} addLesson={timetable.addLesson} moveLesson={timetable.moveLesson} clearTimetable={timetable.clearTimetable} updatePeriodDuration={timetable.updatePeriodDuration} reset={timetable.reset} keyFor={timetable.keyFor} /> : <SetupWizard onComplete={timetable.configure} />}
      </motion.div>
    </div>
  </main>;
}
