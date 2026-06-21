import { fetchUserDataByEmail } from "@/lib/data/user-data";
import { getAuthSession } from "@/lib/getAuthSession";
import { BOARDS } from "@/lib/exam-constants";

type BoardKey = "CAIE" | "Edexcel" | "Edexcel_IAL" | "AQA" | "OCR" | "WJEC";

export type UserProfile = {
  name: string;
  email: string;
  redditUsername: string;
  discordUsername: string;
  boards: BoardKey[];
  subjectsAS: string[];
  subjectsA2: string[];
  examSession: string[];
  receiveEmails: boolean;
};

function normalizeSubjects(arr?: string[] | null) {
  if (!arr) return [];
  return arr;
}

function deriveBoardsFromProfile(
  subjectsAS: string[],
  subjectsA2: string[],
  examSession: string[],
  boards: BoardKey[]
): BoardKey[] {
  if (boards.length > 0) return boards;

  const used = new Set<BoardKey>();
  [...subjectsAS, ...subjectsA2, ...examSession].forEach((key) => {
    const board = (key || "").split("::")[0] as BoardKey;
    if (BOARDS.some((entry) => entry.key === board)) used.add(board);
  });

  return Array.from(used);
}

type UserDataProfileDoc = {
  name?: string;
  email?: string;
  redditUsername?: string;
  discordUsername?: string;
  boards?: string[];
  subjectsAS?: string[];
  subjectsA2?: string[];
  examSession?: string[] | string;
  receiveEmails?: boolean;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const session = await getAuthSession();
  const email = session?.user?.email;
  if (!email) return null;

  const user = (await fetchUserDataByEmail(email)) as UserDataProfileDoc | null;
  if (!user) return null;

  const subjectsAS = normalizeSubjects(user.subjectsAS);
  const subjectsA2 = normalizeSubjects(user.subjectsA2);
  const examSession = Array.isArray(user.examSession)
    ? user.examSession
    : user.examSession
      ? [user.examSession]
      : [];
  const storedBoards = Array.isArray(user.boards)
    ? (user.boards as BoardKey[])
    : [];

  return {
    name: user.name ?? "",
    email: user.email ?? "",
    redditUsername: user.redditUsername ?? "",
    discordUsername: user.discordUsername ?? "",
    boards: deriveBoardsFromProfile(
      subjectsAS,
      subjectsA2,
      examSession,
      storedBoards
    ),
    subjectsAS,
    subjectsA2,
    examSession,
    receiveEmails:
      typeof user.receiveEmails === "boolean" ? user.receiveEmails : false,
  };
}
