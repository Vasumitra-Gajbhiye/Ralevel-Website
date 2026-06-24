import Link from "next/link";

const boards = [
  {
    name: "Cambridge",
    slug: "cambridge",
    levels: ["AS Level", "A2 Level"],
  },
  {
    name: "Edexcel IAL",
    slug: "edexcel-ial",
    levels: ["Year 1", "Year 2"],
  },
  {
    name: "Edexcel UK",
    slug: "edexcel-uk",
    levels: ["Year 1", "Year 2"],
  },
  {
    name: "AQA",
    slug: "aqa",
    levels: ["A Level"],
  },
  {
    name: "OCR",
    slug: "ocr",
    levels: ["A Level"],
  },
  {
    name: "WJEC",
    slug: "wjec",
    levels: ["A Level"],
  },
];

export default function BoardNavigation() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Heading */}
      <h1 className="text-4xl font-semibold tracking-tight text-ink">
        Choose Your Board
      </h1>
      <p className="mt-3 text-slate-600">
        Access structured notes, questions, and resources by exam board.
      </p>

      {/* Boards */}
      <div className="mt-12 space-y-10">
        {boards.map((board) => (
          <div key={board.slug}>
            {/* Board Title */}
            <h2 className="text-2xl font-semibold text-ink">{board.name}</h2>

            {/* Levels */}
            <div className="mt-4 space-y-2">
              {board.levels.map((level) => (
                <Link
                  key={level}
                  href={`/${board.slug}/${level
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="block text-cyan-600 text-lg hover:text-cyan-800 transition"
                >
                  {level}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
