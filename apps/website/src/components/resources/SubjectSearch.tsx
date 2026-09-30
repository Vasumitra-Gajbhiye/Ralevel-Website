"use client";

import {
  SubjectSearchAutocomplete,
  type SearchAutocompleteItem,
} from "@/components/resources/SubjectSearchAutocomplete";
import type { ResourceSubjectSummary } from "@/types/resources2";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function SubjectSearch({
  subjects,
}: {
  subjects: ResourceSubjectSummary[];
}) {
  const router = useRouter();

  const items = useMemo(
    () => subjects.map((s, index) => ({ name: s.subject, id: index + 1 })),
    [subjects],
  );

  const handleOnSelect = (item: SearchAutocompleteItem) => {
    const selected = subjects[item.id - 1];
    if (selected) {
      router.push(`/resources/${selected.slug}`);
    }
  };

  const formatResult = (item: SearchAutocompleteItem) => (
    <span style={{ display: "block", textAlign: "left" }}>{item.name}</span>
  );

  return (
    <div className="relative z-20 w-[400px] max-sm:w-full max-sm:max-w-[300px]">
      <SubjectSearchAutocomplete
        items={items}
        onSelect={handleOnSelect}
        autoFocus
        formatResult={formatResult}
        maxResults={4}
        placeholder="Enter Subject Name"
      />
    </div>
  );
}
