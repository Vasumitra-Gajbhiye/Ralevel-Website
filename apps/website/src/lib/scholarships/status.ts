import { CLOSING_SOON_DAYS } from "./constants";
import { daysBetween, formatDate, todayUtc } from "./format";

export type DeadlineKind =
  | "open"
  | "closing_soon"
  | "closed"
  | "opening_soon"
  | "rolling"
  | "unknown";

export type DeadlineState = {
  kind: DeadlineKind;
  daysLeft: number | null;
  label: string;
  /** Worth a coloured pill (per the minimal-UI rule: only urgent/closed/upcoming). */
  highlight: boolean;
};

type DeadlineFields = {
  deadline: string | null;
  opensAt: string | null;
  rolling: boolean;
  deadlineNote?: string;
};

/** Computed at read time — never stored, since it changes daily. */
export function getDeadlineState(
  { deadline, opensAt, rolling, deadlineNote }: DeadlineFields,
  now = new Date(),
): DeadlineState {
  const today = todayUtc(now);

  if (opensAt) {
    const opens = new Date(`${opensAt}T00:00:00Z`);
    if (opens > today) {
      return {
        kind: "opening_soon",
        daysLeft: deadline ? daysBetween(today, new Date(`${deadline}T00:00:00Z`)) : null,
        label: `Opens ${formatDate(opensAt, { now })}`,
        highlight: true,
      };
    }
  }

  if (rolling) {
    return { kind: "rolling", daysLeft: null, label: "Rolling deadline", highlight: false };
  }

  if (!deadline) {
    return {
      kind: "unknown",
      daysLeft: null,
      label: deadlineNote || "Deadline varies",
      highlight: false,
    };
  }

  const daysLeft = daysBetween(today, new Date(`${deadline}T00:00:00Z`));

  if (daysLeft < 0) {
    return { kind: "closed", daysLeft, label: "Closed", highlight: true };
  }

  if (daysLeft <= CLOSING_SOON_DAYS) {
    const label =
      daysLeft === 0
        ? "Closes today"
        : daysLeft === 1
          ? "Closes tomorrow"
          : `Closes in ${daysLeft} days`;
    return { kind: "closing_soon", daysLeft, label, highlight: true };
  }

  return {
    kind: "open",
    daysLeft,
    label: `Closes ${formatDate(deadline, { now })}`,
    highlight: false,
  };
}
