import { TimetableApp } from "@/components/timetable/TimetableApp";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <main>
        <TimetableApp />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
