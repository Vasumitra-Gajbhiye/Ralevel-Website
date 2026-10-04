import { FilterProvider, ResultsArea } from "@/components/scholarships/FilterProvider";
import { HubHeader } from "@/components/scholarships/HubTabs";
import PageLinks from "@/components/scholarships/PageLinks";
import ScholarshipFilterBar, {
  SortSelect,
  type MatchInfo,
} from "@/components/scholarships/ScholarshipFilterBar";
import ScholarshipRow from "@/components/scholarships/ScholarshipRow";
import SuggestDialog from "@/components/scholarships/SuggestDialog";
import { countSaves, getSavedStatuses } from "@/lib/data/scholarship-saves";
import { countProfileMatches, searchScholarships } from "@/lib/data/scholarships";
import { getStudyPlans } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import {
  hasAnyScholarshipFilter,
  parseScholarshipFilters,
  scholarshipFiltersToQuery,
} from "@/lib/scholarships/filters";
import { hasStudyPlans } from "@/lib/scholarships/match";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Scholarships | r/alevel",
  description:
    "Find scholarships for your undergraduate degree, foundation year or summer programme — filtered by destination, nationality and funding.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ScholarshipsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseScholarshipFilters(await searchParams);
  const session = await getAuthSession();
  const rawPlans = session ? await getStudyPlans() : null;
  const plans = hasStudyPlans(rawPlans) ? rawPlans : null;
  if (!plans) filters.match = false;

  const [results, matchCount, savedCount] = await Promise.all([
    searchScholarships(filters, plans),
    plans ? countProfileMatches(plans) : Promise.resolve(0),
    session ? countSaves(session.userData.id) : Promise.resolve(0),
  ]);
  const statuses = session
    ? await getSavedStatuses(session.userData.id, results.items.map((s) => s.id))
    : {};

  const matchInfo: MatchInfo = !session
    ? { kind: "signed-out" }
    : plans
      ? { kind: "ready", count: matchCount }
      : { kind: "no-plans" };

  const filtered = hasAnyScholarshipFilter(filters);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 tracking-normal sm:px-8 sm:pt-20">
      <HubHeader
        title="Scholarships"
        subtitle="Funding for your degree, foundation year or summer programme."
        active="scholarships"
        savedCount={savedCount}
      />

      <FilterProvider>
        <div className="mt-10">
          <ScholarshipFilterBar filters={filters} matchInfo={matchInfo} />
        </div>

        <ResultsArea>
          <div className="mt-8 flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-sm text-slate-500">
              {results.total} {results.total === 1 ? "scholarship" : "scholarships"}
            </p>
            <SortSelect filters={filters} />
          </div>

          {results.items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {results.items.map((scholarship) => (
                <ScholarshipRow
                  key={scholarship.id}
                  scholarship={scholarship}
                  signedIn={Boolean(session)}
                  saveState={
                    statuses[scholarship.id]
                      ? { status: statuses[scholarship.id], completedRequirementIds: [] }
                      : null
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="py-16 text-center text-slate-500">
              {filtered ? (
                <>
                  No scholarships match these filters.{" "}
                  <Link href="/scholarships" className="font-medium text-blue-600 hover:text-blue-700">
                    Clear filters
                  </Link>
                </>
              ) : (
                "Scholarships are on their way — check back soon."
              )}
            </p>
          )}

          <PageLinks
            page={results.page}
            totalPages={results.totalPages}
            hrefFor={(page) => `/scholarships${scholarshipFiltersToQuery({ ...filters, page })}`}
          />
        </ResultsArea>
      </FilterProvider>

      <p className="mt-16 text-center text-sm text-slate-500">
        Know a scholarship we&apos;re missing?{" "}
        <SuggestDialog signedIn={Boolean(session)} triggerLabel="Suggest it" />
      </p>
    </div>
  );
}
