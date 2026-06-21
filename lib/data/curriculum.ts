import { cachedQuery } from "@/lib/data-cache";
import connectDB from "@/lib/mongodb";
import Glossary from "@/models/Glossary";
import Topic from "@/models/Topic";

const CURRICULUM_REVALIDATE = 86400;

type CurriculumPath = {
  board: string;
  level: string;
  subject: string;
  code: string;
  chapterSlug: string;
  slug: string;
};

type SubjectPath = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
};

type LevelSubject = {
  subjectName: string;
  examCode: string;
};

export async function getSubjectsForLevel(board: string, level: string) {
  return cachedQuery(
    ["curriculum", "level-subjects", board, level],
    async () => {
      await connectDB();
      const topics = await Topic.find({ board, level, published: true })
        .select("subject code")
        .lean<{ subject: string; code: string }[]>();

      const seen = new Set<string>();
      return topics.reduce<LevelSubject[]>((acc, topic) => {
        const key = `${topic.subject}:${topic.code}`;
        if (seen.has(key)) return acc;
        seen.add(key);
        acc.push({
          subjectName: topic.subject,
          examCode: topic.code,
        });
        return acc;
      }, []);
    },
    { revalidate: CURRICULUM_REVALIDATE, tags: ["curriculum"] }
  );
}

export async function getPublishedCurriculumPaths() {
  return cachedQuery(
    ["curriculum", "paths"],
    async () => {
      await connectDB();
      return Topic.find({ published: true })
        .select("board level subject code chapterSlug slug")
        .lean<CurriculumPath[]>();
    },
    { revalidate: CURRICULUM_REVALIDATE, tags: ["curriculum"] }
  );
}

export async function getSubjectPathsForStaticParams(): Promise<SubjectPath[]> {
  const paths = await getPublishedCurriculumPaths();
  const seen = new Set<string>();

  return paths.reduce<SubjectPath[]>((acc, path) => {
    const key = `${path.board}:${path.level}:${path.subject}:${path.code}`;
    if (seen.has(key)) return acc;
    seen.add(key);
    acc.push({
      board: path.board,
      level: path.level,
      subject: path.subject,
      subjectCode: path.code,
    });
    return acc;
  }, []);
}

export async function getTopicPathsForStaticParams() {
  const paths = await getPublishedCurriculumPaths();
  return paths.map((path) => ({
    board: path.board,
    level: path.level,
    subject: path.subject,
    subjectCode: path.code,
    chapter: path.chapterSlug,
    topic: path.slug,
  }));
}

export async function getSubjectTopics(
  board: string,
  level: string,
  subject: string,
  subjectCode: string
) {
  return cachedQuery(
    ["curriculum", "subject-topics", board, level, subject, subjectCode],
    async () => {
      await connectDB();
      return Topic.find({
        board,
        level,
        subject,
        code: String(subjectCode),
        published: true,
      })
        .sort({ topicId: 1 })
        .lean();
    },
    { revalidate: CURRICULUM_REVALIDATE, tags: ["curriculum"] }
  );
}

type TopicDoc = {
  title: string;
  detailedNotesMarkdown: string;
  topicId: string;
  slug: string;
};

export async function getTopicPageData(
  board: string,
  level: string,
  subject: string,
  subjectCode: string,
  chapter: string,
  topic: string
) {
  return cachedQuery(
    [
      "curriculum",
      "topic-page",
      board,
      level,
      subject,
      subjectCode,
      chapter,
      topic,
    ],
    async () => {
      await connectDB();
      const [topicDoc, chapterTopics] = await Promise.all([
        Topic.findOne({
          board,
          level,
          subject,
          chapterSlug: chapter,
          code: subjectCode,
          slug: topic,
          published: true,
        }).lean<TopicDoc>(),
        Topic.find({
          board,
          level,
          subject,
          chapterSlug: chapter,
          code: subjectCode,
          published: true,
        })
          .sort({ topicId: 1 })
          .lean(),
      ]);

      return { topicDoc, chapterTopics };
    },
    { revalidate: CURRICULUM_REVALIDATE, tags: ["curriculum"] }
  );
}

export async function getGlossaryTerms(
  board: string,
  level: string,
  subject: string,
  subjectCode: string
) {
  return cachedQuery(
    ["curriculum", "glossary", board, level, subject, subjectCode],
    async () => {
      await connectDB();
      return Glossary.find({
        board,
        level,
        subject,
        code: String(subjectCode),
      }).lean();
    },
    { revalidate: CURRICULUM_REVALIDATE, tags: ["curriculum"] }
  );
}
