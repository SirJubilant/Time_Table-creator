# Weekly Timetable Creator

A browser-based school timetable planner for assigning subjects to classes, preventing teacher clashes, and adjusting the generated schedule with drag and drop.

## Getting started

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:3000`.

## Create a timetable

1. Enter class names in **Classes**, separated by commas.
2. Set the school days and total periods per week.
3. Enter break period numbers, separated by commas. Leave blank for no breaks.
4. Add each teacher and their subjects.
5. Select the weekdays on which each teacher can teach.
6. For each subject, enter the exact class names taught by that teacher.
7. Select **Generate timetable**.

The generator spreads subject periods across the selected weekdays while avoiding occupied class slots, breaks, and teacher conflicts. Dragging a lesson to a weekday outside its teacher's selection is also rejected.

## Teacher conflicts

Conflicts are based on teacher names, including names in a multi-teacher value. For example, `Alice / Bob`, `Alice, Bob`, and `Alice & Bob` are treated as containing both teachers. Matching is case-insensitive and repeated spaces are ignored.

## Adjust the timetable

- Drag a subject card into an empty class/period slot to add a lesson.
- Drag an existing lesson to an empty slot to move it.
- Drag an existing lesson onto an occupied slot to swap lessons, when the swap does not create a teacher conflict.
- Break slots cannot receive lessons.
- Edit the **Minutes** row below the period headers to set a separate duration for each period.

If a drop is rejected, the lesson stays in its original position and a notification explains the conflict when applicable.

## Export and reset

- **Export A3 PDF** downloads the visible timetable as a landscape A3 PDF.
- **Clear lessons** removes scheduled lessons while keeping the setup.
- **Start over** removes the saved timetable and returns to setup.

The current timetable is saved in browser local storage and remains available after refreshing in the same browser.

## Development commands

```bash
npm run typecheck
npm run lint
npm run build
```
