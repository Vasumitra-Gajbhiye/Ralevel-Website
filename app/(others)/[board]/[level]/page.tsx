import connectDB from "@/lib/mongodb";
import Subject from "@/models/subjectGuide";
import Link from "next/link";

type Props = {
  params: Promise<{
    board: string;
    level: string;
  }>;
};

export default async function LevelPage({ params }: Props) {
  const { board, level } = await params;

  await connectDB();

  // fetch all subjects for this board
  const subjects = await Subject.find().lean();

  // optional: filter if you store board/level later
  // for now just map unique subjects
  const uniqueSubjects = Array.from(
    new Map(subjects.map((s: any) => [s.subjectName, s])).values()
  );

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <h1 className="text-4xl font-semibold tracking-tight text-ink capitalize">
        {board.replace("-", " ")} · {level.replace("-", " ")}
      </h1>

      <p className="mt-3 text-slate-600">
        Choose a subject to explore notes, practice questions, and resources.
      </p>

      {/* Subjects Grid */}
      <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {uniqueSubjects.map((subject: any) => (
          <Link
            key={subject.subjectName}
            href={`/${board}/${level}/${subject.subjectName.toLowerCase()}/${
              subject.examCode
            }`}
            className="group rounded-xl border border-slate-200 p-5 hover:border-cyan-400 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink group-hover:text-cyan-600 transition">
                {subject.subjectName}
              </h2>

              <span className="text-sm text-slate-400 group-hover:text-cyan-500 transition">
                →
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">{subject.examCode}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
