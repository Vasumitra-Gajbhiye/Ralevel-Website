"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  FIELD_OF_STUDY_LABELS,
  FIELDS_OF_STUDY,
  FUNDING_TYPE_LABELS,
  FUNDING_TYPES,
  PROVIDER_TYPE_LABELS,
  PROVIDER_TYPES,
  STUDY_LEVEL_LABELS,
  STUDY_LEVELS,
  type AidBasis,
  type FieldOfStudy,
  type FundingType,
  type ProviderType,
  type StudyLevel,
} from "@/lib/scholarships/constants";
import { COUNTRIES } from "@/lib/scholarships/countries";
import {
  countMoreFilters,
  hasAnyScholarshipFilter,
  SCHOLARSHIP_SORT_LABELS,
  SCHOLARSHIP_SORTS,
  scholarshipFiltersToQuery,
  type ScholarshipFilters,
  type ScholarshipSort,
} from "@/lib/scholarships/filters";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import FilterDropdown, { ToggleChip, type FilterOption } from "./FilterDropdown";
import { useFilterNav } from "./FilterProvider";
import SearchInput from "./SearchInput";

const COUNTRY_OPTIONS: FilterOption[] = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
const options = <T extends string>(keys: readonly T[], labels: Record<T, string>) =>
  keys.map((k) => ({ value: k, label: labels[k] }));
const LEVEL_OPTIONS = options(STUDY_LEVELS, STUDY_LEVEL_LABELS);
const FUNDING_OPTIONS = options(FUNDING_TYPES, FUNDING_TYPE_LABELS);
const FIELD_OPTIONS = options(FIELDS_OF_STUDY, FIELD_OF_STUDY_LABELS);
const PROVIDER_OPTIONS = options(PROVIDER_TYPES, PROVIDER_TYPE_LABELS);

export type MatchInfo =
  | { kind: "signed-out" }
  | { kind: "no-plans" }
  | { kind: "ready"; count: number };

function useFilterUpdate(filters: ScholarshipFilters) {
  const { navigate } = useFilterNav();
  return (patch: Partial<ScholarshipFilters>) => {
    posthog.capture("scholarship_filter_applied", { filters: Object.keys(patch) });
    navigate(scholarshipFiltersToQuery({ ...filters, ...patch, page: 1 }));
  };
}

const toggleIn = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export default function ScholarshipFilterBar({
  filters,
  matchInfo,
}: {
  filters: ScholarshipFilters;
  matchInfo: MatchInfo;
}) {
  const set = useFilterUpdate(filters);
  const moreCount = countMoreFilters(filters);

  return (
    <div className="space-y-4">
      <SearchInput
        value={filters.q}
        placeholder="Search scholarships"
        onChange={(q) => q !== filters.q && set({ q })}
      />

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Destination"
          options={COUNTRY_OPTIONS}
          selected={filters.dest}
          onChange={(dest) => set({ dest })}
          searchable
        />
        <FilterDropdown
          label="Level"
          options={LEVEL_OPTIONS}
          selected={filters.level}
          onChange={(level) => set({ level: level as StudyLevel[] })}
        />
        <FilterDropdown
          label="Funding"
          options={FUNDING_OPTIONS}
          selected={filters.funding}
          onChange={(funding) => set({ funding: funding as FundingType[] })}
        />
        <MoreFilters filters={filters} count={moreCount} set={set} />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <ToggleChip
          active={filters.funding.includes("full")}
          onClick={() => set({ funding: toggleIn(filters.funding, "full" as FundingType) })}
        >
          Fully funded
        </ToggleChip>
        <ToggleChip active={filters.closing} onClick={() => set({ closing: !filters.closing })}>
          Closing soon
        </ToggleChip>
        <ToggleChip active={filters.noEssay} onClick={() => set({ noEssay: !filters.noEssay })}>
          No essay
        </ToggleChip>
        <ToggleChip
          active={filters.basis.includes("need")}
          onClick={() => set({ basis: toggleIn(filters.basis, "need" as AidBasis) })}
        >
          Need-based
        </ToggleChip>
        {hasAnyScholarshipFilter(filters) && (
          <button
            type="button"
            onClick={() =>
              set({
                q: "",
                dest: [],
                level: [],
                funding: [],
                nat: "",
                field: [],
                basis: [],
                provider: [],
                noEssay: false,
                noTest: false,
                noInterview: false,
                closing: false,
                closed: false,
                match: false,
              })
            }
            className="ml-auto px-2 py-1 text-sm text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <MatchLine info={matchInfo} active={filters.match} onToggle={() => set({ match: !filters.match })} />
    </div>
  );
}

function MatchLine({
  info,
  active,
  onToggle,
}: {
  info: MatchInfo;
  active: boolean;
  onToggle: () => void;
}) {
  const linkClass = "font-medium text-blue-600 hover:text-blue-700";

  return (
    <p className="flex items-center gap-2 text-sm text-slate-600">
      <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />
      {info.kind === "signed-out" && (
        <span>
          <Link href="/sign-in?redirect_url=/scholarships" className={linkClass}>
            Sign in
          </Link>{" "}
          to see scholarships that match you.
        </span>
      )}
      {info.kind === "no-plans" && (
        <span>
          <Link href="/profile" className={linkClass}>
            Add your nationality and where you&apos;d like to study
          </Link>{" "}
          to see matches.
        </span>
      )}
      {info.kind === "ready" && (
        <span>
          {active
            ? `Showing scholarships that match your profile`
            : `${info.count} ${info.count === 1 ? "scholarship matches" : "scholarships match"} your profile`}{" "}
          ·{" "}
          <button type="button" onClick={onToggle} className={linkClass}>
            {active ? "Show all" : "Show"}
          </button>
        </span>
      )}
    </p>
  );
}

function MoreFiltersFields({
  filters,
  set,
}: {
  filters: ScholarshipFilters;
  set: (patch: Partial<ScholarshipFilters>) => void;
}) {
  const checks: { key: "noTest" | "noInterview" | "closed"; label: string }[] = [
    { key: "noTest", label: "No SAT/ACT" },
    { key: "noInterview", label: "No interview" },
    { key: "closed", label: "Show closed scholarships" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Eligible nationality</p>
        <FilterDropdown
          label="Any nationality"
          options={COUNTRY_OPTIONS}
          selected={filters.nat ? [filters.nat] : []}
          onChange={(v) => set({ nat: v[0] ?? "" })}
          searchable
          single
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Field of study</p>
        <FilterDropdown
          label="Any field"
          options={FIELD_OPTIONS}
          selected={filters.field}
          onChange={(field) => set({ field: field as FieldOfStudy[] })}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Offered by</p>
        <FilterDropdown
          label="Anyone"
          options={PROVIDER_OPTIONS}
          selected={filters.provider}
          onChange={(provider) => set({ provider: provider as ProviderType[] })}
        />
      </div>
      <div className="space-y-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.basis.includes("merit")}
            onChange={() => set({ basis: toggleIn(filters.basis, "merit" as AidBasis) })}
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />
          Merit-based
        </label>
        {checks.map((check) => (
          <label
            key={check.key}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={filters[check.key]}
              onChange={() => set({ [check.key]: !filters[check.key] })}
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            {check.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function MoreFilters({
  filters,
  count,
  set,
}: {
  filters: ScholarshipFilters;
  count: number;
  set: (patch: Partial<ScholarshipFilters>) => void;
}) {
  const trigger = (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        count ? "text-blue-700" : "text-slate-600 hover:text-slate-900",
      )}
    >
      <SlidersHorizontal className="h-4 w-4" />
      More filters
      {count > 0 && (
        <span className="rounded-full bg-blue-600 px-1.5 text-xs text-white">{count}</span>
      )}
    </button>
  );

  return (
    <>
      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="start" className="w-72 tracking-normal">
            <MoreFiltersFields filters={filters} set={set} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 tracking-normal">
            <SheetTitle className="mb-5 text-base">More filters</SheetTitle>
            <MoreFiltersFields filters={filters} set={set} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function SortSelect({ filters }: { filters: ScholarshipFilters }) {
  const { navigate } = useFilterNav();
  return (
    <label className="flex items-center gap-1.5 text-sm text-slate-500">
      Sort
      <select
        value={filters.sort}
        onChange={(e) =>
          navigate(
            scholarshipFiltersToQuery({
              ...filters,
              sort: e.target.value as ScholarshipSort,
              page: 1,
            }),
          )
        }
        className="cursor-pointer rounded-md bg-transparent py-1 font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        {SCHOLARSHIP_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {SCHOLARSHIP_SORT_LABELS[sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
