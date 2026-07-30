import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function FlashcardSetNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-ink">Flashcard set not found</h1>
      <p className="mt-2 text-slate-600">
        This set does not exist or may have been removed.
      </p>
      <Link
        href=".."
        className="mt-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to flashcards
      </Link>
    </div>
  );
}
