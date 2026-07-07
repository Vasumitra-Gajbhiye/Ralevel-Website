"use client";

import FlashcardContentRenderer from "@/components/flashcards/FlashcardContentRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { TopicFlashcardSetSummary } from "@/types/topic-flashcards";
import { cn } from "@/lib/utils";
import type { PracticeRating } from "@/types/flashcards";
import { Brain, Lightbulb, RefreshCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type RatingEntry = {
  cardId: string;
  rating: PracticeRating;
};

type View = "prompt" | "answer" | "results";

type FlashcardPracticeModalProps = {
  set: TopicFlashcardSetSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getEncouragement(easyCount: number, total: number) {
  const pct = total > 0 ? easyCount / total : 0;
  if (pct >= 0.8) return "Excellent recall — keep it up!";
  if (pct >= 0.5) return "Good progress — a few more reviews will help.";
  return "Keep practicing — repetition builds strong recall.";
}

export default function FlashcardPracticeModal({
  set,
  open,
  onOpenChange,
}: FlashcardPracticeModalProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const [view, setView] = useState<View>("prompt");
  const [showHint, setShowHint] = useState(false);
  const [ratings, setRatings] = useState<RatingEntry[]>([]);

  const cards = set.cards;
  const currentCard = cards[cardIndex];
  const totalCards = cards.length;
  const progress = totalCards > 0 ? (cardIndex / totalCards) * 100 : 0;

  const resetSession = useCallback(() => {
    setCardIndex(0);
    setView("prompt");
    setShowHint(false);
    setRatings([]);
  }, []);

  useEffect(() => {
    if (open) {
      resetSession();
    }
  }, [open, set.id, resetSession]);

  const handleReveal = useCallback(() => {
    setView("answer");
  }, []);

  const handleRating = useCallback(
    (rating: PracticeRating) => {
      if (!currentCard) return;

      const newRatings = [...ratings, { cardId: currentCard.id, rating }];
      setRatings(newRatings);

      const isLast = cardIndex >= totalCards - 1;
      if (isLast) {
        setView("results");
      } else {
        setCardIndex((i) => i + 1);
        setView("prompt");
        setShowHint(false);
      }
    },
    [currentCard, cardIndex, totalCards, ratings],
  );

  useEffect(() => {
    if (!open || view === "results") return;

    function handler(e: KeyboardEvent) {
      if (view === "prompt" && e.code === "Space") {
        e.preventDefault();
        handleReveal();
      }

      if (view === "answer") {
        if (e.code === "Digit1") handleRating("hard");
        if (e.code === "Digit2") handleRating("medium");
        if (e.code === "Digit3") handleRating("easy");
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, view, handleReveal, handleRating]);

  const hardCount = ratings.filter((r) => r.rating === "hard").length;
  const mediumCount = ratings.filter((r) => r.rating === "medium").length;
  const easyCount = ratings.filter((r) => r.rating === "easy").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-white" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col",
            "max-w-none w-full h-full",
            "left-0 top-0 translate-x-0 translate-y-0",
            "!rounded-none border-0 bg-white p-0 gap-0 shadow-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100",
            "data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0",
          )}
        >
        <DialogTitle className="sr-only">
          {set.title} — Flashcard Practice
        </DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-slate-900"
          aria-label="Close practice"
        >
          <X className="h-6 w-6" />
        </button>

        <header className="shrink-0 border-b border-slate-200 px-4 sm:px-8 py-4 pr-16">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-600 truncate">
              {set.title}
            </span>
            {view !== "results" && (
              <span className="text-sm text-slate-500 shrink-0">
                {cardIndex + 1} / {totalCards}
              </span>
            )}
          </div>
          {view !== "results" && (
            <div className="mx-auto mt-3 h-1 w-full max-w-4xl bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-cyan-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </header>

        <div className="flex flex-1 items-center justify-center p-4 sm:p-8 bg-white">
          <div className="w-full max-w-4xl">
          {view === "results" ? (
            <div className="border border-slate-200 bg-white p-8 sm:p-12 text-center rounded-none">
              <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
                Session complete
              </h2>
              <p className="mt-2 text-slate-600">
                You reviewed {ratings.length} card{ratings.length !== 1 && "s"}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
                  <p className="text-2xl font-bold text-rose-700">
                    {hardCount}
                  </p>
                  <p className="text-sm text-rose-600 mt-1">Hard</p>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-2xl font-bold text-amber-700">
                    {mediumCount}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">Medium</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-2xl font-bold text-emerald-700">
                    {easyCount}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">Easy</p>
                </div>
              </div>

              <p className="mt-8 text-slate-600">
                {getEncouragement(easyCount, ratings.length)}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Practice again
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full bg-cyan-600 hover:bg-cyan-700 px-6"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : currentCard ? (
            <div className="border border-slate-200 bg-white p-6 sm:p-10 min-h-[480px] flex flex-col rounded-none">
              {view === "prompt" ? (
                <>
                  <span className="inline-flex w-fit items-center rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
                    Prompt
                  </span>

                  <div className="mt-6 flex-1">
                    <FlashcardContentRenderer
                      text={currentCard.question}
                      media={currentCard.questionMedia}
                    />
                  </div>

                  {currentCard.hint && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowHint((h) => !h)}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
                      >
                        <Lightbulb className="h-4 w-4" />
                        {showHint ? "Hide hint" : "Show hint"}
                      </button>
                      {showHint && (
                        <div className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-4 animate-in fade-in duration-200">
                          <FlashcardContentRenderer
                            text={currentCard.hint}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Brain className="h-4 w-4" />
                      Try recalling before revealing.
                    </div>
                    <Button
                      onClick={handleReveal}
                      className="rounded-full bg-cyan-600 hover:bg-cyan-700 px-8 font-semibold"
                    >
                      Reveal answer
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Answer
                  </span>

                  <div className="mt-6">
                    <FlashcardContentRenderer
                      text={currentCard.answer}
                      media={currentCard.answerMedia}
                    />
                  </div>

                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentCard.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-8 border-t border-slate-100">
                    <p className="text-sm text-slate-500 text-center mb-4">
                      How strong was your recall?
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <RatingButton
                        label="Hard"
                        shortcut="1"
                        className="bg-rose-100 hover:bg-rose-200 text-rose-800"
                        onClick={() => handleRating("hard")}
                      />
                      <RatingButton
                        label="Medium"
                        shortcut="2"
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800"
                        onClick={() => handleRating("medium")}
                      />
                      <RatingButton
                        label="Easy"
                        shortcut="3"
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                        onClick={() => handleRating("easy")}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function RatingButton({
  label,
  shortcut,
  className,
  onClick,
}: {
  label: string;
  shortcut: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-2xl px-4 py-4 font-semibold transition-colors",
        className,
      )}
    >
      <span>{label}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm font-bold">
        {shortcut}
      </span>
    </button>
  );
}
