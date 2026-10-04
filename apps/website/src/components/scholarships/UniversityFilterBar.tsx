"use client";

import {
  AID_POLICIES,
  AID_POLICY_LABELS,
  type AidPolicy,
} from "@/lib/scholarships/constants";
import { countryName } from "@/lib/scholarships/countries";
import {
  UNIVERSITY_SORT_LABELS,
  UNIVERSITY_SORTS,
  universityFiltersToQuery,
  type UniversityFilters,
  type UniversitySort,
} from "@/lib/scholarships/filters";
import FilterDropdown, { ToggleChip } from "./FilterDropdown";
import { useFilterNav } from "./FilterProvider";
import SearchInput from "./SearchInput";

const POLICY_OPTIONS = AID_POLICIES.map((p) => ({ value: p, label: AID_POLICY_LABELS[p] }));

export default function UniversityFilterBar({
  filters,
  countries,
}: {
  filters: UniversityFilters;
  countries: string[];
}) {
  const { navigate } = useFilterNav();
  const set = (patch: Partial<UniversityFilters>) =>
    navigate(universityFiltersToQuery({ ...filters, ...patch, page: 1 }));

  return (
    <div className="space-y-4">
      <SearchInput
        value={filters.q}
        placeholder="Search universities"
        onChange={(q) => q !== filters.q && set({ q })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Country"
          options={countries.map((c) => ({ value: c, label: countryName(c) }))}
          selected={filters.country}
          onChange={(country) => set({ country })}
          searchable={countries.length > 8}
        />
        <FilterDropdown
          label="Aid policy"
          options={POLICY_OPTIONS}
          selected={filters.policy}
          onChange={(policy) => set({ policy: policy as AidPolicy[] })}
        />
        <ToggleChip active={filters.fullNeed} onClick={() => set({ fullNeed: !filters.fullNeed })}>
          Meets full need
        </ToggleChip>
      </div>
    </div>
  );
}

export function UniversitySortSelect({ filters }: { filters: UniversityFilters }) {
  const { navigate } = useFilterNav();
  return (
    <label className="flex items-center gap-1.5 text-sm text-slate-500">
      Sort
      <select
        value={filters.sort}
        onChange={(e) =>
          navigate(
            universityFiltersToQuery({
              ...filters,
              sort: e.target.value as UniversitySort,
              page: 1,
            }),
          )
        }
        className="cursor-pointer rounded-md bg-transparent py-1 font-medium text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        {UNIVERSITY_SORTS.map((sort) => (
          <option key={sort} value={sort}>
            {UNIVERSITY_SORT_LABELS[sort]}
          </option>
        ))}
      </select>
    </label>
  );
}
