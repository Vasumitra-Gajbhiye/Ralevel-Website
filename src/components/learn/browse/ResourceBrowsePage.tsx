import BrowseBoardsSection from "@/components/learn/BrowseBoardsSection";
import ContinueLearningSection from "@/components/learn/ContinueLearningSection";
import PopularSubjectsSection from "@/components/learn/PopularSubjectsSection";
import RecentUpdatesSection from "@/components/learn/RecentUpdatesSection";
import BrowsePageHero from "@/components/learn/browse/BrowsePageHero";
import DailyReviewSection from "@/components/learn/browse/DailyReviewSection";
import QuickPracticeSection from "@/components/learn/browse/QuickPracticeSection";
import type { ResourceBrowseConfig } from "@/lib/resource-browse-data";
import { Fragment } from "react";

type ResourceBrowsePageProps = {
  config: ResourceBrowseConfig;
};

export default function ResourceBrowsePage({ config }: ResourceBrowsePageProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-28 md:gap-36">
      <BrowsePageHero
        title={config.hero.title}
        subtitle={config.hero.subtitle}
        searchPlaceholder={config.hero.searchPlaceholder}
      />

      {config.sections.map((section, index) => {
        switch (section.type) {
          case "continue":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <ContinueLearningSection
                  title={section.title}
                  description={section.description}
                  items={section.items}
                />
              </Fragment>
            );
          case "daily-review":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <DailyReviewSection
                  title={section.title}
                  description={section.description}
                  stats={section.stats}
                />
              </Fragment>
            );
          case "quick-practice":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <QuickPracticeSection
                  title={section.title}
                  description={section.description}
                  items={section.items}
                />
              </Fragment>
            );
          case "popular-subjects":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <PopularSubjectsSection
                  title={section.title}
                  description={section.description}
                  items={section.items}
                />
              </Fragment>
            );
          case "browse-boards":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <BrowseBoardsSection
                  title={section.title}
                  description={section.description}
                />
              </Fragment>
            );
          case "recent":
            return (
              <Fragment key={`${section.type}-${index}`}>
                <RecentUpdatesSection
                  title={section.title}
                  description={section.description}
                  items={section.items}
                />
              </Fragment>
            );
        }
      })}
    </div>
  );
}
