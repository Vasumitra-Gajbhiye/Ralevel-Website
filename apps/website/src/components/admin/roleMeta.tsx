import type { Role } from "@/lib/roles";
import {
  Archive,
  BadgeInfo,
  Bot,
  Brush,
  Crown,
  HelpingHand,
  PenLine,
  Shield,
  Star,
  User,
  UserCog,
} from "lucide-react";

export const ROLE_META: Record<
  Role,
  { color: string; icon: React.ElementType }
> = {
  owner: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Crown,
  },
  admin: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Shield,
  },
  mod_dep_head: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Shield,
  },
  helper_dep_head: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Shield,
  },
  graphic_dep_head: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Shield,
  },
  info_dep_head: {
    color: "bg-neutral-100 text-neutral-800 border-neutral-200",
    icon: Shield,
  },
  reddit_dep_head: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Shield,
  },
  resource_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  resource_staff: {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: UserCog,
  },
  scholarship_dep_head: {
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: Shield,
  },
  scholarship_staff: {
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: UserCog,
  },
  senior_mod: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserCog,
  },
  junior_mod: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: User,
  },
  trial_mod: {
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: User,
  },
  graphic_designer: {
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: Brush,
  },
  writer_dep_head: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Shield,
  },
  senior_writer: {
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: Star,
  },
  writer: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: PenLine,
  },
  bot_dev: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Bot,
  },
  former_staff: {
    color: "bg-zinc-100 text-zinc-600 border-zinc-200",
    icon: Archive,
  },
  informative_team: {
    color: "bg-violet-100 text-violet-600 border-violet-200",
    icon: BadgeInfo,
  },
  helper: {
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    icon: HelpingHand,
  },
};
