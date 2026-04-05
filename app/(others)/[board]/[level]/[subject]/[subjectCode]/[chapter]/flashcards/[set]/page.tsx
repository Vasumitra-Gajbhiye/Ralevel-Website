import connectDB from "@/lib/mongodb";
import Topic from "@/models/Topic";
import Flashcards from "./pageClient";
type Props = {
  params: Promise<{
    board: string;
    level: string;
    subject: string;
    subjectCode: string;
    chapter: string;
    set: string;
  }>;
};

export default async function FlashcardSet({ params }: Props) {
  await connectDB();
  const { board, level, subject, subjectCode, chapter, set } = await params;
  // console.log(set);
  const flashcards = await Topic.find({
    board,
    level,
    subject,
    slug: set,
    chapterSlug: chapter,
    code: subjectCode,
  })
    .select("flashcards title")
    .lean();

  // const data = initialData || sampleLibrary?.sets?.[0]?.cards || [];
  const parsedData = JSON.parse(JSON.stringify(flashcards))[0];
  // console.log(parsedData);
  const data = parsedData.flashcards;
  const title = parsedData.title;
  // console.log(data);
  return <Flashcards flashData={data} title={title} />;

  // return <h1>hi</h1>;
}
