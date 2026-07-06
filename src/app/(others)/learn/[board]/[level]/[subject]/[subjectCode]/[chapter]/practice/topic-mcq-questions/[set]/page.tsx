import { getMcqPracticeSet } from "@/lib/data/mcq";
import McqPractice from "@/components/quiz/McqPractice";

type PageParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  set: string;
};

export default async function McqSetPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolved = await params;
  const { title, description, questions, stats } =
    await getMcqPracticeSet(resolved);

  return (
    <McqPractice
      title={title}
      description={description}
      questions={questions}
      setStats={stats}
    />
  );
}
