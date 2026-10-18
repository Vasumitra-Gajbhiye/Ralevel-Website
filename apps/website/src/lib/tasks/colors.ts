/** List colours for the /tasks workspace. Full class names so Tailwind keeps them. */
export const TASK_COLORS = {
  slate: { dot: "bg-slate-400", text: "text-slate-600" },
  red: { dot: "bg-red-500", text: "text-red-600" },
  orange: { dot: "bg-orange-500", text: "text-orange-600" },
  amber: { dot: "bg-amber-400", text: "text-amber-600" },
  green: { dot: "bg-green-500", text: "text-green-600" },
  teal: { dot: "bg-teal-500", text: "text-teal-600" },
  cyan: { dot: "bg-cyan-500", text: "text-cyan-600" },
  blue: { dot: "bg-blue-500", text: "text-blue-600" },
  violet: { dot: "bg-violet-500", text: "text-violet-600" },
  pink: { dot: "bg-pink-500", text: "text-pink-600" },
} as const;

export type TaskColor = keyof typeof TASK_COLORS;

export const TASK_COLOR_KEYS = Object.keys(TASK_COLORS) as TaskColor[];

export function colorClasses(color: string | null | undefined) {
  return TASK_COLORS[(color ?? "slate") as TaskColor] ?? TASK_COLORS.slate;
}

/** Priority 1 (urgent) .. 4 (none), Todoist-style. */
export const PRIORITY_STYLES = {
  1: { label: "P1", ring: "border-red-500", fill: "bg-red-50", text: "text-red-600" },
  2: { label: "P2", ring: "border-orange-500", fill: "bg-orange-50", text: "text-orange-600" },
  3: { label: "P3", ring: "border-blue-500", fill: "bg-blue-50", text: "text-blue-600" },
  4: { label: "P4", ring: "border-gray-400", fill: "bg-transparent", text: "text-gray-500" },
} as const;

export type Priority = keyof typeof PRIORITY_STYLES;
