// components/PremiumSidebar.tsx
"use client";

import { SUBJECTS_BY_BOARD } from "@/lib/exam-constants";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

export interface PremiumSidebarProps {
  name: string;
  redditUsername: string;
  discordUsername: string;
  email?: string;
  image?: string | null;
  isPremium?: boolean;
  boards: BoardKey[];
  subjectsAS: string[]; // expected: "BOARD::CODE" or "CODE"
  subjectsA2: string[]; // same
  examSession: string[]; // expected: "BOARD::SessionLabel"
  receiveEmails?: boolean;
  onToggleBoard?: (board: BoardKey) => void;
  onSignOut?: () => void;
  onUpgrade?: () => void;
  onSwitchAccount: () => void;
}

/** Helper: resolve subject name from SUBJECTS_BY_BOARD safely */
function resolveSubjectName(board: string | null, code: string) {
  if (!board) return code;
  const bd = board as BoardKey;
  try {
    const list = (
      SUBJECTS_BY_BOARD as Record<BoardKey, { code: string; name: string }[]>
    )[bd];
    if (!list) return code;
    const found = list.find((s) => s.code === code || s.code === code.trim());
    return found ? found.name : code;
  } catch {
    return code;
  }
}

export default function PremiumSidebar({
  name,
  redditUsername,
  discordUsername,
  image,
  isPremium = false,
  boards,
  subjectsAS,
  subjectsA2,
  examSession,
  onToggleBoard,
  onSignOut,
  onUpgrade,
  onSwitchAccount,
}: PremiumSidebarProps) {
  const boardsCount = boards.length;
  const totalSubjects = subjectsAS.length + subjectsA2.length;
  const totalSessions = examSession.length;

  // completeness is exactly 4 checks (boards, AS, A2, sessions)
  const completeness =
    ((boardsCount > 0 ? 1 : 0) +
      (subjectsAS.length > 0 ? 1 : 0) +
      (subjectsA2.length > 0 ? 1 : 0) +
      (totalSessions > 0 ? 1 : 0)) *
    25;

  const ring = isPremium
    ? "bg-gradient-to-br from-[#60a5fa] via-[#3b82f6] to-[#06b6d4]"
    : "bg-white/60";

  const BoardChip = ({
    board,
    active,
    onClick,
  }: {
    board: string;
    active?: boolean;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-shadow focus:outline-none ${
        active
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_6px_20px_rgba(59,130,246,0.14)]"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
      title={board}
    >
      {board}
    </button>
  );

  const SubjectChip = ({ val }: { val: string }) => {
    const parts = (val || "").split("::");
    const board = parts.length >= 2 ? parts[0] : null;
    const code = parts.length >= 2 ? parts[1] : parts[0];
    const name = resolveSubjectName(board, code);
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-xs text-slate-700 border border-slate-100 shadow-sm">
        <span className="font-medium">{name}</span>
        <span className="text-[11px] text-slate-400">• {code}</span>
      </div>
    );
  };

  const SessionChip = ({ val }: { val: string }) => {
    const parts = (val || "").split("::");
    const label =
      parts.length > 1 ? `${parts[0]} — ${parts.slice(1).join("::")}` : val;
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-xs text-slate-700 border border-slate-100 shadow-sm">
        {label}
      </div>
    );
  };

  return (
    <aside aria-label="Profile sidebar" className="hidden md:block w-80 ">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="h-full"
      >
        <div
          className="h-full rounded-2xl p-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,249,255,0.85))] border border-[rgba(59,130,246,0.08)] shadow-lg backdrop-blur"
          style={{ boxShadow: "0 18px 40px rgba(59,130,246,0.06)" }}
        >
          {/* header */}
          <div className="flex items-center gap-3">
            <div className={`relative w-16 h-16 rounded-full p-0.5 ${ring}`}>
              <div className="overflow-hidden rounded-full bg-white">
                <Image
                  src={image || "/default-avatar.png"}
                  alt={name || "User"}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              {isPremium && (
                <span
                  className="absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{
                    transform: "translate(25%,-25%)",
                    background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
                    boxShadow: "0 8px 30px rgba(59,130,246,0.18)",
                  }}
                >
                  NITRO
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* toned down name weight */}
              <div className="text-base font-semibold tracking-tight text-slate-900">
                {name}
              </div>
              <button
                onClick={onSwitchAccount}
                className="w-full px-3 py-2 text-sm rounded-md border hover:bg-slate-50"
              >
                Switch Google account
              </button>
            </div>
          </div>

          {/* stats */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-md bg-white/60 p-2 text-center border border-slate-100 flex flex-col items-center">
              <div className="text-sm font-medium text-slate-700">Boards</div>
              <div className="text-lg font-semibold text-slate-900">
                {boardsCount}
              </div>
            </div>
            <div className="rounded-md bg-white/60 p-2 text-center border border-slate-100 flex flex-col items-center">
              <div className="text-sm font-medium text-slate-700">Subjects</div>
              <div className="text-lg font-semibold text-slate-900">
                {totalSubjects}
              </div>
            </div>
            <div className="rounded-md bg-white/60 p-2 text-center border border-slate-100 flex flex-col items-center">
              <div className="text-sm font-medium text-slate-700">Sessions</div>
              <div className="text-lg font-semibold text-slate-900">
                {totalSessions}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            {redditUsername && (
              <div className="flex items-center gap-2 text-slate-600">
                <Image
                  src="/icons/reddit.svg"
                  width={16}
                  height={16}
                  alt="Reddit"
                />
                <span>u/{redditUsername}</span>
              </div>
            )}

            {discordUsername && (
              <div className="flex items-center gap-2 text-slate-600">
                <Image
                  src="/icons/discord.svg"
                  width={16}
                  height={16}
                  alt="Discord"
                />
                <span>{discordUsername}</span>
              </div>
            )}
          </div>

          {/* progress: only show when not 100% */}
          {completeness < 100 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">
                  Profile completeness
                </div>
                <div className="text-xs text-slate-500">{completeness}%</div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#60a5fa] to-[#2563eb] transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          )}

          {/* CTA row */}
          <div className="mt-5 flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                onClick={() => onUpgrade?.()}
              >
                {isPremium ? "Manage Nitro" : "Get Nitro"}
              </Button>

              <Button
                variant="ghost"
                className="border border-slate-200"
                onClick={() => onSignOut?.()}
              >
                Sign out
              </Button>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100" />

          {/* single selections area */}
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">
              Your selections
            </h4>

            {/* show only selected boards */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Boards</div>
              <div className="flex flex-wrap gap-2">
                {boards.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No boards selected
                  </div>
                ) : (
                  boards.map((bd) => (
                    <BoardChip
                      key={bd}
                      board={bd}
                      active={true}
                      onClick={() => onToggleBoard?.(bd)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* subjects (show full name when possible) */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">Subjects</div>
              <div className="flex flex-wrap gap-2">
                {totalSubjects === 0 ? (
                  <div className="text-sm text-slate-500">
                    No subjects selected
                  </div>
                ) : (
                  <>
                    {subjectsAS.map((s) => (
                      <SubjectChip key={`as-${s}`} val={s} />
                    ))}
                    {subjectsA2.map((s) => (
                      <SubjectChip key={`a2-${s}`} val={s} />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* sessions */}
            <div className="mb-1">
              <div className="text-xs text-slate-500 mb-2">Exam sessions</div>
              <div className="flex flex-wrap gap-2">
                {totalSessions === 0 ? (
                  <div className="text-sm text-slate-500">
                    No sessions selected
                  </div>
                ) : (
                  examSession.map((s) => <SessionChip key={s} val={s} />)
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-400">
            <div>r/alevel • beta</div>
            <div className="mt-2">Themes & premium badges coming soon</div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
