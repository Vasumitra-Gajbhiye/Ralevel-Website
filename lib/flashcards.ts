import { sampleLibrary } from "@/lib/sample-data";
import type {
  Flashcard,
  FlashcardLibrary,
  FlashcardProgress,
  FlashcardSet,
  PracticeRating,
  PracticeSessionState,
  SetAnalytics,
} from "@/types/flashcards";
import { PASTEL_COLORS } from "@/types/flashcards";

export const FLASHCARD_STORAGE_KEY = "pastel-recall-library";

const HARD_INTERVAL_HOURS = [4, 8, 12, 24, 48, 72, 96, 120];
const EASY_INTERVAL_DAYS = [1, 2, 4, 7, 10, 14, 21, 30, 45];

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIsoString() {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => asString(entry)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function addMinutes(timestamp: string, minutes: number) {
  const date = new Date(timestamp);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function addHours(timestamp: string, hours: number) {
  const date = new Date(timestamp);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function addDays(timestamp: string, days: number) {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function sanitizeColor(value: unknown) {
  const candidate = asString(value) as (typeof PASTEL_COLORS)[number];
  return PASTEL_COLORS.includes(candidate) ? candidate : PASTEL_COLORS[0];
}

export function createDefaultCardProgress(): FlashcardProgress {
  return {
    attempts: 0,
    mediumCount: 0,
    hardCount: 0,
    easyCount: 0,
    consecutiveCorrect: 0,
    learningStep: 0,
    masteryScore: 0,
    lastRating: null,
    lastReviewedAt: null,
    nextDueAt: null,
    masteredAt: null,
  };
}

function sanitizeProgress(input: unknown): FlashcardProgress {
  const defaults = createDefaultCardProgress();
  if (!isRecord(input)) {
    return defaults;
  }

  return {
    attempts: Math.max(
      0,
      Math.round(asNumber(input.attempts, defaults.attempts))
    ),
    mediumCount: Math.max(
      0,
      Math.round(
        asNumber(
          "mediumCount" in input ? input.mediumCount : input.againCount,
          defaults.mediumCount
        )
      )
    ),
    hardCount: Math.max(
      0,
      Math.round(asNumber(input.hardCount, defaults.hardCount))
    ),
    easyCount: Math.max(
      0,
      Math.round(asNumber(input.easyCount, defaults.easyCount))
    ),
    consecutiveCorrect: Math.max(
      0,
      Math.round(
        asNumber(input.consecutiveCorrect, defaults.consecutiveCorrect)
      )
    ),
    learningStep: clamp(
      Math.round(asNumber(input.learningStep, defaults.learningStep)),
      0,
      8
    ),
    masteryScore: clamp(
      Math.round(asNumber(input.masteryScore, defaults.masteryScore)),
      0,
      100
    ),
    lastRating:
      input.lastRating === "medium" ||
      input.lastRating === "hard" ||
      input.lastRating === "easy"
        ? input.lastRating
        : input.lastRating === "again"
        ? "hard"
        : null,
    lastReviewedAt: asNullableString(input.lastReviewedAt),
    nextDueAt: asNullableString(input.nextDueAt),
    masteredAt: asNullableString(input.masteredAt),
  };
}

function sanitizeCard(input: unknown): Flashcard | null {
  if (!isRecord(input)) {
    return null;
  }

  const question =
    asString(input.question) || asString(input.front) || asString(input.prompt);
  const answer =
    asString(input.answer) || asString(input.back) || asString(input.solution);

  if (!question || !answer) {
    return null;
  }

  const timestamp = nowIsoString();

  return {
    id: asString(input.id) || createId("card"),
    question,
    answer,
    hint: asString(input.hint),
    tags: asStringArray(input.tags),
    progress: sanitizeProgress(input.progress),
    createdAt: asString(input.createdAt) || timestamp,
    updatedAt: asString(input.updatedAt) || timestamp,
  };
}

function sanitizeSet(input: unknown): FlashcardSet | null {
  if (!isRecord(input)) {
    return null;
  }

  const title = asString(input.title) || asString(input.name);
  if (!title) {
    return null;
  }

  const rawCards = Array.isArray(input.cards)
    ? input.cards
    : Array.isArray(input.flashcards)
    ? input.flashcards
    : [];

  const timestamp = nowIsoString();

  return {
    id: asString(input.id) || createId("set"),
    title,
    description: asString(input.description),
    color: sanitizeColor(input.color),
    cards: rawCards
      .map((card) => sanitizeCard(card))
      .filter((card): card is Flashcard => card !== null),
    createdAt: asString(input.createdAt) || timestamp,
    updatedAt: asString(input.updatedAt) || timestamp,
  };
}

function ensureUniqueIds(cards: Flashcard[]) {
  const usedIds = new Set<string>();

  return cards.map((card) => {
    let nextId = card.id || createId("card");

    while (usedIds.has(nextId)) {
      nextId = createId("card");
    }

    usedIds.add(nextId);
    return {
      ...card,
      id: nextId,
    };
  });
}

export function isCardMastered(progress: FlashcardProgress) {
  return progress.masteryScore >= 82 && progress.consecutiveCorrect >= 3;
}

export function isCardDue(progress: FlashcardProgress, now = new Date()) {
  if (progress.attempts === 0) {
    return true;
  }

  if (!progress.nextDueAt) {
    return true;
  }

  return new Date(progress.nextDueAt).getTime() <= now.getTime();
}

function getPracticePriority(card: Flashcard, now = new Date()) {
  const progress = card.progress;
  if (progress.attempts === 0) {
    return 220;
  }

  const nextDueTime = progress.nextDueAt
    ? new Date(progress.nextDueAt).getTime()
    : 0;
  const overdueHours =
    nextDueTime > 0 ? Math.max(0, now.getTime() - nextDueTime) / 3_600_000 : 12;
  const dueWeight = isCardDue(progress, now)
    ? Math.min(140, 55 + overdueHours * 8)
    : 0;
  const weaknessWeight = 100 - progress.masteryScore;
  const lapseWeight = progress.hardCount * 12 + progress.mediumCount * 7;
  const stabilityWeight = Math.max(0, 3 - progress.consecutiveCorrect) * 8;

  return dueWeight + weaknessWeight + lapseWeight + stabilityWeight;
}

export function createEmptySet() {
  const timestamp = nowIsoString();

  return {
    id: createId("set"),
    title: "",
    description: "",
    color: PASTEL_COLORS[0],
    cards: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies FlashcardSet;
}

export function createFlashcardDraft(input: {
  question: string;
  answer: string;
  hint: string;
  tags: string[];
}) {
  const timestamp = nowIsoString();

  return {
    id: createId("card"),
    question: input.question.trim(),
    answer: input.answer.trim(),
    hint: input.hint.trim(),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    progress: createDefaultCardProgress(),
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies Flashcard;
}

export function normalizeFlashcardImport(input: unknown): FlashcardLibrary {
  if (Array.isArray(input)) {
    return {
      version: 1,
      sets: input
        .map((entry) => sanitizeSet(entry))
        .filter((entry): entry is FlashcardSet => entry !== null)
        .map((entry) => ({ ...entry, cards: ensureUniqueIds(entry.cards) })),
    };
  }

  if (isRecord(input) && Array.isArray(input.sets)) {
    return {
      version: 1,
      sets: input.sets
        .map((entry) => sanitizeSet(entry))
        .filter((entry): entry is FlashcardSet => entry !== null)
        .map((entry) => ({ ...entry, cards: ensureUniqueIds(entry.cards) })),
    };
  }

  const singleSet = sanitizeSet(input);
  if (singleSet) {
    return {
      version: 1,
      sets: [{ ...singleSet, cards: ensureUniqueIds(singleSet.cards) }],
    };
  }

  return {
    version: 1,
    sets: [],
  };
}

export function mergeLibraries(
  current: FlashcardLibrary,
  incoming: FlashcardLibrary
) {
  const usedSetIds = new Set(current.sets.map((set) => set.id));
  const importedSets = incoming.sets.map((set) => {
    let nextSetId = set.id || createId("set");

    while (usedSetIds.has(nextSetId)) {
      nextSetId = createId("set");
    }

    usedSetIds.add(nextSetId);

    return {
      ...set,
      id: nextSetId,
      cards: ensureUniqueIds(set.cards),
      updatedAt: nowIsoString(),
    };
  });

  return {
    version: 1,
    sets: [...importedSets, ...current.sets],
  } satisfies FlashcardLibrary;
}

export function parseFlashcardJson(text: string) {
  const parsed = JSON.parse(text) as unknown;
  return normalizeFlashcardImport(parsed);
}

export function getInitialLibrary() {
  return normalizeFlashcardImport(sampleLibrary);
}

export function createPracticeSession(cards: Flashcard[]) {
  const orderedCards = [...cards].sort(
    (left, right) => getPracticePriority(right) - getPracticePriority(left)
  );

  return {
    activeQueue: orderedCards.map((card) => card.id),
    reviewQueue: [],
    revealed: false,
    history: [],
    masteredCardIds: [],
  } satisfies PracticeSessionState;
}

export function applyPracticeReview(
  progress: FlashcardProgress,
  rating: PracticeRating,
  reviewedAt = nowIsoString()
) {
  const nextProgress: FlashcardProgress = {
    ...progress,
    attempts: progress.attempts + 1,
    lastRating: rating,
    lastReviewedAt: reviewedAt,
  };

  if (rating === "hard") {
    nextProgress.hardCount += 1;
    nextProgress.consecutiveCorrect = 0;
    nextProgress.learningStep = Math.max(0, progress.learningStep - 1);
    nextProgress.masteryScore = clamp(
      Math.round(progress.masteryScore * 0.55 + 10),
      0,
      100
    );
    nextProgress.nextDueAt = addMinutes(reviewedAt, 10);
    nextProgress.masteredAt = null;
    return nextProgress;
  }

  if (rating === "medium") {
    nextProgress.mediumCount += 1;
    nextProgress.consecutiveCorrect = Math.max(
      1,
      progress.consecutiveCorrect + 1
    );
    nextProgress.learningStep = clamp(progress.learningStep + 1, 0, 8);
    nextProgress.masteryScore = clamp(
      Math.round(progress.masteryScore * 0.82 + 18),
      0,
      100
    );
    nextProgress.nextDueAt = addHours(
      reviewedAt,
      HARD_INTERVAL_HOURS[
        Math.min(nextProgress.learningStep + 1, HARD_INTERVAL_HOURS.length - 1)
      ]
    );
    nextProgress.masteredAt = null;
    return nextProgress;
  }

  nextProgress.easyCount += 1;
  nextProgress.consecutiveCorrect = Math.max(
    3,
    progress.consecutiveCorrect + 2
  );
  nextProgress.learningStep = clamp(progress.learningStep + 2, 0, 8);
  nextProgress.masteryScore = 100;
  nextProgress.nextDueAt = addDays(
    reviewedAt,
    EASY_INTERVAL_DAYS[
      Math.min(nextProgress.learningStep, EASY_INTERVAL_DAYS.length - 1)
    ]
  );
  nextProgress.masteredAt = reviewedAt;

  return nextProgress;
}

function removeCardId(queue: string[], cardId: string) {
  return queue.filter((queuedCardId) => queuedCardId !== cardId);
}

export function applyPracticeRating(
  session: PracticeSessionState,
  card: Flashcard,
  rating: PracticeRating
) {
  const reviewedAt = nowIsoString();
  const nextProgress = applyPracticeReview(card.progress, rating, reviewedAt);
  const [, ...remainingActiveQueue] = session.activeQueue;
  let nextActiveQueue = removeCardId(remainingActiveQueue, card.id);
  let nextReviewQueue = removeCardId(session.reviewQueue, card.id);
  const nextMasteredCardIds = new Set(session.masteredCardIds);

  if (rating === "easy") {
    nextMasteredCardIds.add(card.id);
  }

  if (rating === "medium") {
    nextReviewQueue.push(card.id);
  }

  if (rating === "hard") {
    const insertAt = Math.min(1, nextActiveQueue.length);
    nextActiveQueue.splice(insertAt, 0, card.id);
  }

  if (nextActiveQueue.length === 0 && nextReviewQueue.length > 0) {
    nextActiveQueue = [...nextReviewQueue];
    nextReviewQueue = [];
  }

  return {
    activeQueue: nextActiveQueue,
    reviewQueue: nextReviewQueue,
    revealed: false,
    history: [
      ...session.history,
      {
        cardId: card.id,
        rating,
        reviewedAt,
        masteryScoreAfterReview: nextProgress.masteryScore,
      },
    ],
    masteredCardIds: Array.from(nextMasteredCardIds),
  } satisfies PracticeSessionState;
}

export function getSetAnalytics(
  flashcardSet: FlashcardSet,
  now = new Date()
): SetAnalytics {
  const totalCards = flashcardSet.cards.length;
  const practicedCards = flashcardSet.cards.filter(
    (card) => card.progress.attempts > 0
  ).length;
  const newCards = flashcardSet.cards.filter(
    (card) => card.progress.attempts === 0
  ).length;
  const masteredCards = flashcardSet.cards.filter((card) =>
    isCardMastered(card.progress)
  ).length;
  const dueCards = flashcardSet.cards.filter((card) =>
    isCardDue(card.progress, now)
  ).length;
  const strugglingCards = flashcardSet.cards.filter((card) => {
    const progress = card.progress;
    return (
      progress.attempts > 0 &&
      (progress.masteryScore < 55 || progress.hardCount > progress.easyCount)
    );
  }).length;
  const averageMasteryScore =
    totalCards > 0
      ? Math.round(
          flashcardSet.cards.reduce(
            (total, card) => total + card.progress.masteryScore,
            0
          ) / totalCards
        )
      : 0;

  const lastReviewedTimes = flashcardSet.cards
    .map((card) => card.progress.lastReviewedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime());

  const lastPracticedAt =
    lastReviewedTimes.length > 0
      ? new Date(Math.max(...lastReviewedTimes)).toISOString()
      : null;

  if (totalCards === 0) {
    return {
      totalCards,
      practicedCards,
      newCards,
      masteredCards,
      dueCards,
      strugglingCards,
      averageMasteryScore,
      lastPracticedAt,
      readiness: "empty",
      recommendationTitle: "Build this set first",
      recommendationBody: "Add a few cards before starting a practice cycle.",
    };
  }

  if (practicedCards === 0) {
    return {
      totalCards,
      practicedCards,
      newCards,
      masteredCards,
      dueCards,
      strugglingCards,
      averageMasteryScore,
      lastPracticedAt,
      readiness: "fresh",
      recommendationTitle: "Start a first recall round",
      recommendationBody:
        "This set has not been practiced yet, so a full pass will establish the cards and expose the weaker ones.",
    };
  }

  if (dueCards === 0 && masteredCards === totalCards) {
    return {
      totalCards,
      practicedCards,
      newCards,
      masteredCards,
      dueCards,
      strugglingCards,
      averageMasteryScore,
      lastPracticedAt,
      readiness: "ready",
      recommendationTitle: "Ready to move on",
      recommendationBody:
        "All cards in this set are currently stable. You can switch to another set and come back when these are due again.",
    };
  }

  if (
    dueCards <= Math.max(1, Math.floor(totalCards * 0.15)) &&
    masteredCards >= Math.ceil(totalCards * 0.7)
  ) {
    return {
      totalCards,
      practicedCards,
      newCards,
      masteredCards,
      dueCards,
      strugglingCards,
      averageMasteryScore,
      lastPracticedAt,
      readiness: "almost-ready",
      recommendationTitle: "Almost ready to move on",
      recommendationBody:
        "Only a small number of cards still need attention. One more focused round should finish the set cleanly.",
    };
  }

  return {
    totalCards,
    practicedCards,
    newCards,
    masteredCards,
    dueCards,
    strugglingCards,
    averageMasteryScore,
    lastPracticedAt,
    readiness: "review",
    recommendationTitle: "Practice this set again",
    recommendationBody:
      "There are still due or unstable cards here, so another round on this set will likely pay off more than switching away now.",
  };
}
