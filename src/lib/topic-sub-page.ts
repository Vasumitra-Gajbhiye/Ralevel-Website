import { getTopicPageData } from "@/lib/data/curriculum";

export type TopicRouteParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  topic: string;
};

export async function loadTopicSubPage(params: Promise<TopicRouteParams>) {
  const route = await params;
  const { topicDoc, chapterTopics } = await getTopicPageData(
    route.board,
    route.level,
    route.subject,
    route.subjectCode,
    route.chapter,
    route.topic,
  );

  return {
    ...route,
    topicDoc,
    chapterTitle: chapterTopics[0]?.chapterTitle as string | undefined,
  };
}
