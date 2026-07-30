import MarkdownRenderer from "@/components/MarkdownRenderer";
import TopicNotFound from "@/components/curriculum/TopicNotFound";
import TopicSubPageShell from "@/components/curriculum/TopicSubPageShell";
import { loadTopicSubPage } from "@/lib/topic-sub-page";

const markdown = `
## Key Diagrams

### SI Base Units Table

A standard table showing the seven SI base quantities and their units:

| Quantity | Unit | Symbol |
|----------|------|--------|
| Length | metre | m |
| Mass | kilogram | kg |
| Time | second | s |
| Current | ampere | A |
| Temperature | kelvin | K |
| Amount | mole | mol |
| Luminous intensity | candela | cd |

---

### Measurement Diagram

![Measurement setup](https://upload.wikimedia.org/wikipedia/commons/1/14/Caliper.svg)

When measuring length with a vernier caliper:

- Read the main scale first
- Add the vernier scale reading
- Record with appropriate precision and unit
`;

export default async function TopicDiagramsPage({
  params,
}: {
  params: Promise<{
    board: string;
    level: string;
    subject: string;
    subjectCode: string;
    chapter: string;
    topic: string;
  }>;
}) {
  const { topicDoc, chapterTitle, ...route } = await loadTopicSubPage(params);

  if (!topicDoc) {
    return <TopicNotFound />;
  }

  return (
    <TopicSubPageShell
      {...route}
      topicTitle={topicDoc.title}
      chapterTitle={chapterTitle}
      pageTitle="Diagrams"
      activeSlug="diagrams"
    >
      <p className="text-slate-600 mb-8">
        Understand key diagrams used in this topic with clear visual
        explanations.
      </p>

      <MarkdownRenderer content={markdown} />
    </TopicSubPageShell>
  );
}
