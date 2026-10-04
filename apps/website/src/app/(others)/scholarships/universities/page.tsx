import { FilterProvider, ResultsArea } from "@/components/scholarships/FilterProvider";
import { HubHeader } from "@/components/scholarships/HubTabs";
import PageLinks from "@/components/scholarships/PageLinks";
import UniversityFilterBar, {
  UniversitySortSelect,
} from "@/components/scholarships/UniversityFilterBar";
import UniversityRow from "@/components/scholarships/UniversityRow";
import { countSaves } from "@/lib/data/scholarship-saves";
import { getUniversityCountries, searchUniversities } from "@/lib/data/scholarships";
import { getAuthSession } from "@/lib/getAuthSession";
import { parseUniversityFilters, universityFiltersToQuery } from "@/lib/scholarships/filters";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Universities with financial aid | r/alevel",
  description:
    "Universities that give strong financial aid to international students — need-blind admissions, full-need aid and average award sizes.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UniversitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseUniversityFilters(await searchParams);
  const session = await getAuthSession();

  const [results, countries, savedCount] = await Promise.all([
    searchUniversities(filters),
    getUniversityCountries(),
    session ? countSaves(session.userData.id) : Promise.resolve(0),
  ]);

  const filtered = Boolean(
    filters.q || filters.country.length || filters.policy.length || filters.fullNeed,
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 tracking-normal sm:px-8 sm:pt-20">
      <HubHeader
        title="Universities"
        subtitle="Where international students get the most financial aid."
        active="universities"
        savedCount={savedCount}
      />

      <FilterProvider>
        <div className="mt-10">
          <UniversityFilterBar filters={filters} countries={countries} />
        </div>

        <ResultsArea>
          <div className="mt-8 flex items-center justify-between border-b border-slate-200 pb-3">
            <p className="text-sm text-slate-500">
              {results.total} {results.total === 1 ? "university" : "universities"}
            </p>
            <UniversitySortSelect filters={filters} />
          </div>

          {results.items.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {results.items.map((university) => (
                <UniversityRow key={university.id} university={university} />
              ))}
            </ul>
          ) : (
            <p className="py-16 text-center text-slate-500">
              {filtered ? (
                <>
                  No universities match these filters.{" "}
                  <Link
                    href="/scholarships/universities"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </Link>
                </>
              ) : (
                "Universities are on their way — check back soon."
              )}
            </p>
          )}

          <PageLinks
            page={results.page}
            totalPages={results.totalPages}
            hrefFor={(page) =>
              `/scholarships/universities${universityFiltersToQuery({ ...filters, page })}`
            }
          />
        </ResultsArea>
      </FilterProvider>

      <p className="mt-16 text-center text-xs text-slate-400">
        Aid figures come from each university&apos;s Common Data Set (section H6) and change
        yearly.
      </p>
    </div>
  );
}
