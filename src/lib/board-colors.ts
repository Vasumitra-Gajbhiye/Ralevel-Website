export const BOARD_COLORS: Record<string, string> = {
  cambridge: "bg-sky-100 hover:bg-sky-200/80",
  "edexcel-ial": "bg-emerald-100 hover:bg-emerald-200/80",
  "edexcel-uk": "bg-violet-100 hover:bg-violet-200/80",
  aqa: "bg-rose-100 hover:bg-rose-200/80",
  ocr: "bg-amber-100 hover:bg-amber-200/80",
  wjec: "bg-teal-100 hover:bg-teal-200/80",
};

export const BOARD_COLOR_FALLBACK = "bg-slate-100 hover:bg-slate-200/80";

export function getBoardColor(slug: string) {
  return BOARD_COLORS[slug] ?? BOARD_COLOR_FALLBACK;
}
