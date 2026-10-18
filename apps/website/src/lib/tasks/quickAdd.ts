/**
 * Todoist-style quick add: "Post update fri 5pm p1 @aishak #launch every monday".
 *
 * Pulls out, in order: a recurrence phrase, a priority (p1–p4), an @assignee,
 * a #list, then a date/time (chrono, IST). Each match becomes a token the UI
 * shows as a removable chip; removing one re-parses with that kind ignored.
 * Client-only in practice (loaded lazily); the server validates structured
 * fields and never parses free text.
 */
import { en } from "chrono-node";
import { formatDue, formatTime12, IST_OFFSET_MIN, istDayKey, istTimeOf, istTodayKey } from "./dates";
import {
  firstOccurrence,
  formatRecurrence,
  normalizeRecurrence,
  parseRecurrence,
  type Recurrence,
} from "./recurrence";

export type TokenKind = "recurrence" | "date" | "priority" | "assignee" | "list";

export type QuickAddToken = { kind: TokenKind; start: number; end: number; label: string };

export type QuickAddMember = { id: string; nickname: string | null; name: string | null };
export type QuickAddList = { id: string; name: string };

export type QuickAddResult = {
  title: string;
  dueOn: string | null;
  dueTime: string | null;
  recurrence: Recurrence | null;
  priority: 1 | 2 | 3 | 4 | null;
  assigneeId: string | null;
  listId: string | null;
  tokens: QuickAddToken[];
  warnings: string[];
};

export type QuickAddOptions = {
  now?: Date;
  members?: QuickAddMember[];
  lists?: QuickAddList[];
  ignore?: TokenKind[];
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Replaces spans with spaces so later matchers can't reuse them (indices stay put). */
function mask(text: string, spans: { start: number; end: number }[]): string {
  let out = text;
  for (const { start, end } of spans) {
    out = out.slice(0, start) + " ".repeat(end - start) + out.slice(end);
  }
  return out;
}

function lastMatch(re: RegExp, text: string): RegExpExecArray | null {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  let found: RegExpExecArray | null = null;
  for (let m = global.exec(text); m; m = global.exec(text)) found = m;
  return found;
}

export function parseQuickAdd(text: string, options: QuickAddOptions = {}): QuickAddResult {
  const now = options.now ?? new Date();
  const ignore = new Set(options.ignore ?? []);
  const todayKey = istTodayKey(now);
  const tokens: QuickAddToken[] = [];
  const warnings: string[] = [];

  const result: QuickAddResult = {
    title: "",
    dueOn: null,
    dueTime: null,
    recurrence: null,
    priority: null,
    assigneeId: null,
    listId: null,
    tokens,
    warnings,
  };

  const masked = () => mask(text, tokens);

  // 1. Recurrence
  let recurrence: Recurrence | null = null;
  if (!ignore.has("recurrence")) {
    const found = parseRecurrence(text);
    if (found) {
      recurrence = found.rule;
      tokens.push({ kind: "recurrence", start: found.start, end: found.end, label: formatRecurrence(found.rule) });
    }
  }

  // 2. Priority (the last one wins, like Todoist)
  if (!ignore.has("priority")) {
    const m = lastMatch(/(^|\s)(p[1-4])(?=\s|$)/i, masked());
    if (m) {
      const start = m.index + m[1].length;
      result.priority = Number(m[2][1]) as 1 | 2 | 3 | 4;
      tokens.push({ kind: "priority", start, end: start + m[2].length, label: m[2].toUpperCase() });
    }
  }

  // 3. Assignee
  if (!ignore.has("assignee")) {
    const m = /(^|\s)@([a-z0-9_.-]+)/i.exec(masked());
    if (m) {
      const handle = m[2].toLowerCase().replace(/[.]+$/, "");
      const member = options.members?.find((p) => p.nickname?.toLowerCase() === handle);
      if (member) {
        const start = m.index + m[1].length;
        result.assigneeId = member.id;
        tokens.push({ kind: "assignee", start, end: start + 1 + handle.length, label: member.name || `@${handle}` });
      } else if (options.members) {
        warnings.push(`No one called @${handle} can be assigned here`);
      }
    }
  }

  // 4. List
  if (!ignore.has("list") && options.lists?.length) {
    const m = /(^|\s)#([\w-]+)/.exec(masked());
    if (m) {
      const wanted = slug(m[2]);
      const list =
        options.lists.find((l) => slug(l.name) === wanted) ??
        options.lists.find((l) => slug(l.name).startsWith(wanted));
      if (list) {
        const start = m.index + m[1].length;
        result.listId = list.id;
        tokens.push({ kind: "list", start, end: start + 1 + m[2].length, label: list.name });
      } else {
        warnings.push(`No list matches #${m[2]}`);
      }
    }
  }

  // 5. Date and time
  if (!ignore.has("date")) {
    const [found] = en.GB.parse(masked(), { instant: now, timezone: IST_OFFSET_MIN }, { forwardDate: true });
    if (found) {
      const date = found.date();
      const hasTime = found.start.isCertain("hour");
      const hasDay =
        found.start.isCertain("day") || found.start.isCertain("weekday") || found.start.isCertain("month");
      // With a recurrence, a bare time ("every monday 5pm") only sets the time.
      if (!recurrence || hasDay) result.dueOn = istDayKey(date);
      if (hasTime) result.dueTime = istTimeOf(date);
      const label = result.dueOn
        ? formatDue(result.dueOn, hasTime ? date : null, todayKey)
        : result.dueTime
          ? formatTime12(result.dueTime)
          : found.text;
      tokens.push({ kind: "date", start: found.index, end: found.index + found.text.length, label });
    }
  }

  if (recurrence) {
    result.dueOn ??= firstOccurrence(recurrence, todayKey);
    result.recurrence = normalizeRecurrence(recurrence, result.dueOn);
  }

  tokens.sort((a, b) => a.start - b.start);
  result.title = mask(text, tokens).replace(/\s+/g, " ").trim();
  return result;
}
