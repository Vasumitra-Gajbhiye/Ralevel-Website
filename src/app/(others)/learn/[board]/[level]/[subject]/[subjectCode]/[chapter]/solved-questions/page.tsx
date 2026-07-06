import MarkdownRenderer from "@/components/MarkdownRenderer";
import Back from "../components/back";

const markdown = `
> [!solved-example]
> Q:
> Define a physical quantity.
>
> A:
> A physical quantity is a property that can be measured and expressed with a numerical value and a unit.

---

> [!solved-example]
> Q:
> A car accelerates from rest at 2 m/s² for 5 seconds. Find its final velocity.
>
> A:
> Using:
>
> $$
> v = u + at
> $$
>
> $$
> v = 0 + (2)(5) = 10 \\, m/s
> $$

---

> [!solved-example]
> Q:
> Identify the following diagram and explain it.
>
> A:
> This represents a velocity-time graph with constant acceleration.
>
> ![Velocity Time Graph](https://upload.wikimedia.org/wikipedia/commons/3/3b/Velocity-time_graph.png)
`;

export default function SolvedQuestionsPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3">
          <Back />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Solved Questions
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Practice exam-style questions with detailed step-by-step solutions.
          Covers both theory and numerical problems.
        </p>
      </div>

      {/* Content */}
      <MarkdownRenderer content={markdown} />
    </section>
  );
}
