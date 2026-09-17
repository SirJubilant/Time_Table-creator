const PASTEL_COLORS = [
  "#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF",
  "#A0C4FF", "#BDB2FF", "#FFC6FF", "#FFFFFC", "#E2ECE9",
  "#FCE1E4", "#F8AD9D", "#F4978E", "#F08080", "#99E2B4",
  "#88D4AB", "#78C6A3", "#67B99A", "#56AB91", "#469D89"
];

export function getTeacherColor(index: number): string {
  return PASTEL_COLORS[index % PASTEL_COLORS.length];
}

export function getTeacherNames(value: string): string[] {
  return value
    .split(/[,;&/\n]+/)
    .map((name) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase())
    .filter(Boolean);
}

export function teachersShareName(first: string, second: string): boolean {
  const secondNames = new Set(getTeacherNames(second));
  return getTeacherNames(first).some((name) => secondNames.has(name));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
