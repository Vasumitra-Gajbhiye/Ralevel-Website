import { Button } from "@/components/ui/button";
import { topicSubPath } from "@/lib/curriculum-routes";
import {
  TOPIC_STUDY_MODES,
  type TopicStudyModeSlug,
} from "@/lib/topic-study-modes";
import Link from "next/link";

type TopicRouteParams = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
  chapter: string;
  topic: string;
};

type TopicStudyModeButtonsProps = TopicRouteParams & {
  activeSlug?: TopicStudyModeSlug;
};

export default function TopicStudyModeButtons({
  board,
  level,
  subject,
  subjectCode,
  chapter,
  topic,
  activeSlug,
}: TopicStudyModeButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPIC_STUDY_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeSlug === mode.slug;

        return (
          <Link
            key={mode.slug}
            href={topicSubPath(
              board,
              level,
              subject,
              subjectCode,
              chapter,
              topic,
              mode.slug,
            )}
          >
            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {mode.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
