"use client";

import type { MCQ } from "@/lib/quiz/waves-content";
import MathText from "@/components/quiz/MathText";
import OptionButton from "@/components/quiz/OptionButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}
export type QuizKind = "topic" | "final";
type Mode = "quiz" | "summary";

type McqQuizProps = {
  title: string;
  quizKind: QuizKind;
  questions: MCQ[];
  timerEnabled: boolean;
  immediateFeedback: boolean;
};

const QUESTION_TIME = 60;

export default function McqQuiz({
  title,
  quizKind,
  questions,
  timerEnabled,
  immediateFeedback,
}: McqQuizProps) {
  const [mode, setMode] = useState<Mode>("quiz");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null),
  );
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const current = questions[index];
  const progress =
    ((index + (mode === "summary" ? 1 : 0)) / questions.length) * 100;

  const level = useMemo(() => {
    if (score >= 95) return "Wave Master";
    if (score >= 70) return "Resonance Pro";
    if (score >= 45) return "Interference Explorer";
    return "Wave Starter";
  }, [score]);

  function handleOption(optionIndex: number) {
    if (mode !== "quiz") return;

    // toggle selection
    if (selected === optionIndex) {
      setSelected(null);
      setAnswers((prev) => {
        const copy = [...prev];
        copy[index] = null;
        return copy;
      });
      return;
    }

    const correct = optionIndex === current.answer;
    setSelected(optionIndex);

    // store answer
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = optionIndex;
      return copy;
    });

    if (!immediateFeedback) {
      return;
    }

    if (correct) {
      const bonus = 10 + streak * 2;
      const newStreak = streak + 1;
      setScore((s) => s + bonus);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setFeedback(`Correct! +${bonus} points.`);
      return;
    }

    setStreak(0);

    if (optionIndex === -1) {
      setFeedback("Time up! 0 points.");
    } else {
      setFeedback("Not quite. Keep going in no-lives mode.");
    }
  }

  function nextQuestion() {
    const nextIndex = index + 1;
    const outOfQuestions = nextIndex >= questions.length;

    if (outOfQuestions) {
      if (!immediateFeedback) {
        setShowSubmitModal(true);
        return;
      }
      setMode("summary");
      return;
    }

    setIndex(nextIndex);
    setSelected(answers[nextIndex] ?? null);
    setFeedback("");
    setTimeLeft(QUESTION_TIME);
  }

  function restartQuiz() {
    setMode("quiz");
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setFeedback("");
    setTimeLeft(QUESTION_TIME);
  }

  useEffect(() => {
    if (mode !== "quiz" || selected !== null || !timerEnabled) return;

    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          handleOption(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [mode, selected, timerEnabled]);

  useEffect(() => {
    window.render_game_to_text = () =>
      JSON.stringify({
        mode,
        quizKind,
        title,
        timerEnabled,
        immediateFeedback,
        questionIndex: index,
        questionTotal: questions.length,
        score,
        streak,
        bestStreak,
        timeLeft,
        selected,
        currentQuestion: current?.stem ?? null,
      });

    window.advanceTime = (ms: number) => {
      if (mode !== "quiz" || selected !== null || !timerEnabled) return;
      const steps = Math.max(1, Math.round(ms / 1000));
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - steps);
        if (next === 0 && prev > 0) {
          setTimeout(() => handleOption(-1), 0);
        }
        return next;
      });
    };
  }, [
    mode,
    quizKind,
    title,
    timerEnabled,
    immediateFeedback,
    index,
    questions.length,
    score,
    streak,
    bestStreak,
    timeLeft,
    selected,
    current?.stem,
  ]);

  return (
    <section className="mt-10">
      {mode === "quiz" && (
        <>
          <Link
            href="/"
            className="mb-6 inline-block text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
          >
            Back to topics
          </Link>

          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>Score {score}</span>
            <span>Streak {streak}</span>
            <span>{timerEnabled ? `Time ${timeLeft}s` : "Timer off"}</span>
          </div>

          <div className="mt-4 h-1.5 w-full bg-slate-200">
            <div
              className="h-1.5 bg-sky transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {timerEnabled && (
            <div className="mt-2 h-1.5 w-full bg-slate-100">
              <div
                className="h-1.5 bg-amber transition-all"
                style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
              />
            </div>
          )}

          <article className="mt-8 border-t border-slate-200 pt-8">
            <h3 className="text-xl leading-8 text-ink">
              <MathText text={current.stem} inline />
            </h3>
            <div className="mt-6 space-y-3">
              {current.options.map((opt, i) => {
                const isCorrect =
                  immediateFeedback &&
                  selected !== null &&
                  i === current.answer;
                const isWrongPick =
                  immediateFeedback && selected === i && i !== current.answer;
                const isSelected = answers[index] === i || selected === i;
                return (
                  <OptionButton
                    key={`${opt}-${i}`}
                    disabled={immediateFeedback && selected !== null}
                    onClick={() => handleOption(i)}
                    state={
                      isCorrect
                        ? "correct"
                        : isWrongPick
                          ? "wrong"
                          : isSelected
                            ? "selected"
                            : undefined
                    }
                  >
                    <MathText text={opt} inline />
                  </OptionButton>
                );
              })}
            </div>

            {immediateFeedback && selected !== null && (
              <div className="mt-6 border-l-2 border-slate-300 pl-4 text-sm text-slate-700">
                <p className="font-semibold text-ink">{feedback}</p>
                <div className="mt-1">
                  <MathText text={current.explain} inline />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => {
                  if (index > 0) {
                    setIndex((i) => i - 1);
                    setSelected(answers[index - 1] ?? null);
                    setFeedback("");
                    setTimeLeft(QUESTION_TIME);
                  }
                }}
                disabled={index === 0}
                className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={nextQuestion}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
              >
                {index + 1 >= questions.length
                  ? "Show Results"
                  : "Next Question"}
              </button>
            </div>
          </article>
        </>
      )}

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              You are about to submit your quiz and view your results. Make sure
              you have reviewed all questions.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSubmitModal(false);
                setMode("summary");
              }}
            >
              Submit & View Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mode === "summary" && (
        <section className="border-t border-slate-200 pt-8">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Quiz Summary
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {quizKind === "final" ? "Final chapter test" : "Topic solver"}{" "}
            completed. Review your performance and run another attempt.
          </p>

          <div className="mt-7 grid gap-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-slate-500">Final Score</p>
              <p className="text-2xl font-semibold text-sky">{score}</p>
            </div>
            <div>
              <p className="text-slate-500">Best Streak</p>
              <p className="text-2xl font-semibold text-amber">{bestStreak}</p>
            </div>
            <div>
              <p className="text-slate-500">Rank</p>
              <p className="text-2xl font-semibold text-mint">{level}</p>
            </div>
            <div>
              <p className="text-slate-500">Questions Seen</p>
              <p className="text-2xl font-semibold text-ink">
                {Math.min(index + 1, questions.length)}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={restartQuiz}
              className="rounded-md bg-sky px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Retry Same Quiz
            </button>
            <Link
              href="/"
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Back to Topics
            </Link>
          </div>
        </section>
      )}
    </section>
  );
}
