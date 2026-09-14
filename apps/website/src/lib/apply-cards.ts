import {
  BookOpen,
  FileText,
  LifeBuoy,
  Palette,
  PenLine,
  Shield,
  type LucideIcon,
} from "lucide-react";

export const APPLY_CARD_ICON_NAMES = [
  "Shield",
  "PenLine",
  "BookOpen",
  "LifeBuoy",
  "Palette",
  "FileText",
] as const;

export type ApplyCardIconName = (typeof APPLY_CARD_ICON_NAMES)[number];

export const APPLY_CARD_ICONS: Record<ApplyCardIconName, LucideIcon> = {
  Shield,
  PenLine,
  BookOpen,
  LifeBuoy,
  Palette,
  FileText,
};

export const APPLY_CARD_GRADIENTS = [
  "from-orange-400 to-orange-500",
  "from-indigo-400 to-violet-600",
  "from-sky-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-green-600",
  "from-yellow-400 to-amber-500",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-blue-500 to-indigo-600",
  "from-fuchsia-500 to-pink-600",
  "from-slate-500 to-slate-700",
] as const;

export type ApplyCardStatus = "open" | "soon";

export type ApplyFormCardData = {
  title: string;
  description: string;
  status: ApplyCardStatus;
  gradient: string;
  icon: string;
  logo?: string;
  steps: string[];
  ctaText: string;
};

export function isApplyCardIconName(value: string): value is ApplyCardIconName {
  return (APPLY_CARD_ICON_NAMES as readonly string[]).includes(value);
}

export function isApplyCardStatus(value: string): value is ApplyCardStatus {
  return value === "open" || value === "soon";
}

export function getApplyCardIcon(name?: string): LucideIcon {
  if (name && isApplyCardIconName(name)) {
    return APPLY_CARD_ICONS[name];
  }
  return FileText;
}

export function applyCardHref(
  slug: string,
  activeCycleId?: number | null,
): string {
  if (slug === "resource") return "/apply/resource";
  return `/apply/${slug}-intake-${activeCycleId ?? ""}`;
}
