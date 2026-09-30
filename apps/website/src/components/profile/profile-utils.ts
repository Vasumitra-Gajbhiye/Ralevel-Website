import type { UserProfile } from "@/lib/data/user-profile";
import {
  BOARDS,
  SESSIONS_BY_BOARD,
  SUBJECTS_BY_BOARD,
  type BoardKey,
} from "@/lib/exam-constants";

export type SubjectLevel = "AS" | "A Level";

export const SUBJECT_LEVELS: SubjectLevel[] = ["AS", "A Level"];

export const NAME_MAX_LENGTH = 50;

export type ProfileSubject = { key: string; level: SubjectLevel };

export type ProfileForm = {
  name: string;
  redditUsername: string;
  discordUsername: string;
  boards: BoardKey[];
  subjects: ProfileSubject[];
  examSession: string[];
  receiveEmails: boolean;
};

const BOARD_KEYS = new Set<string>(BOARDS.map((b) => b.key));

export function boardName(board: string) {
  return board.replace("_", " ");
}

function boardOf(key: string) {
  return key.split("::")[0];
}

/* --------------------------------- Subjects -------------------------------- */

// Stored as "BOARD::CODE::Name". The name comes from the key itself because
// some boards reuse a code for different subjects.
export function parseSubjectKey(key: string) {
  const [board = "", code = "", ...rest] = key.split("::");
  const name =
    rest.join("::") ||
    SUBJECTS_BY_BOARD[board as BoardKey]?.find((s) => s.code === code)?.name ||
    code;
  return { board, code, name };
}

export function subjectKey(board: BoardKey, subject: { code: string; name: string }) {
  return `${board}::${subject.code}::${subject.name}`;
}

// Edexcel IAL codes carry their level: X is AS, Y is the full A Level.
export function fixedLevel(key: string): SubjectLevel | null {
  const { board, code } = parseSubjectKey(key);
  if (board !== "Edexcel_IAL") return null;
  return code.startsWith("X") ? "AS" : "A Level";
}

// Older profiles could hold the same subject in both lists; treat that as A Level.
function subjectsFromProfile(as: string[], a2: string[]): ProfileSubject[] {
  const inA2 = new Set(a2);
  const keys = Array.from(new Set([...as, ...a2]));
  return keys.map((key) => ({
    key,
    level: fixedLevel(key) ?? (inA2.has(key) ? "A Level" : "AS"),
  }));
}

/* --------------------------------- Sessions -------------------------------- */

// Month (0-indexed) each sitting finishes in, used to hide past sittings.
const SITTING_END_MONTH: Record<string, number> = {
  Jan: 0,
  "Feb/Mar": 2,
  "May/June": 5,
  "Oct/Nov": 10,
};

// Sessions are stored as "BOARD::May/June 2027". Older ones have no year.
export function upcomingSittings(board: BoardKey, now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const sittings: { key: string; label: string; order: number }[] = [];

  for (const session of SESSIONS_BY_BOARD[board] ?? []) {
    const endMonth = SITTING_END_MONTH[session];
    if (endMonth === undefined) continue;
    for (let y = year; y <= year + 2; y++) {
      if (y === year && endMonth < month) continue;
      const label = `${session} ${y}`;
      sittings.push({ key: `${board}::${label}`, label, order: y * 12 + endMonth });
    }
  }

  return sittings.sort((a, b) => a.order - b.order);
}

export function formatSession(key: string) {
  const [board, session] = key.split("::");
  return session ? `${boardName(board)} · ${session}` : key;
}

/* ----------------------------------- Form ---------------------------------- */

export function normalizeReddit(value: string) {
  return value.trim().replace(/^\/?u\//i, "");
}

export function formFromProfile(profile: UserProfile): ProfileForm {
  const subjects = subjectsFromProfile(profile.subjectsAS, profile.subjectsA2);

  // Include boards implied by saved subjects/sessions so every item has its board on.
  const boards = new Set<string>(profile.boards);
  [...subjects.map((s) => s.key), ...profile.examSession].forEach((key) => {
    if (BOARD_KEYS.has(boardOf(key))) boards.add(boardOf(key));
  });

  return {
    name: profile.name,
    redditUsername: normalizeReddit(profile.redditUsername),
    discordUsername: profile.discordUsername,
    boards: Array.from(boards) as BoardKey[],
    subjects,
    examSession: profile.examSession,
    receiveEmails: profile.receiveEmails,
  };
}

export function removeBoard(form: ProfileForm, board: BoardKey): ProfileForm {
  const keep = (key: string) => boardOf(key) !== board;
  return {
    ...form,
    boards: form.boards.filter((b) => b !== board),
    subjects: form.subjects.filter((s) => keep(s.key)),
    examSession: form.examSession.filter(keep),
  };
}

export function toPayload(form: ProfileForm) {
  return {
    name: form.name.trim(),
    redditUsername: normalizeReddit(form.redditUsername),
    discordUsername: form.discordUsername.trim(),
    boards: form.boards,
    subjectsAS: form.subjects.filter((s) => s.level === "AS").map((s) => s.key),
    subjectsA2: form.subjects
      .filter((s) => s.level === "A Level")
      .map((s) => s.key),
    examSession: form.examSession,
    receiveEmails: form.receiveEmails,
  };
}
