"use client";

import { slugify } from "@/lib/slugify";
import {
  SubjectSearchAutocomplete,
  type SearchAutocompleteItem,
} from "@/components/resources/SubjectSearchAutocomplete";
import { useRouter } from "next/navigation";

function Search() {
  const router = useRouter();

  const uuid = [
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Business" },
    { name: "Physics" },
    { name: "Accounting" },
    { name: "Arabic" },
    { name: "Computer Science" },
    { name: "Economics" },
    { name: "English Language" },
    { name: "English Literature" },
    { name: "Environmental Studies" },
    { name: "Further Mathematics" },
    { name: "Geography" },
    { name: "History" },
    { name: "Information Technology" },
    { name: "Media Studies" },
    { name: "Mathematics" },
    { name: "Art And Design" },
    { name: "Drama" },
    { name: "Psychology" },
    { name: "Sociology" },
    { name: "Spanish" },
    { name: "French" },
    { name: "Law" },
    { name: "Music" },
    { name: "Urdu" },
  ];

  const items = uuid.map((item, index) => ({ name: item.name, id: index + 1 }));

  const handleOnSelect = (item: SearchAutocompleteItem) => {
    const selected = uuid[item.id - 1];
    if (selected) {
      router.push(`/resources/${slugify(selected.name)}`);
    }
  };

  const formatResult = (item: SearchAutocompleteItem) => (
    <span style={{ display: "block", textAlign: "left" }}>{item.name}</span>
  );

  return (
    <div className="App">
      <header className="App-header">
        <div className="w-[400px] max-sm:w-[300px]">
          <SubjectSearchAutocomplete
            items={items}
            onSelect={handleOnSelect}
            autoFocus
            formatResult={formatResult}
            maxResults={4}
            placeholder="Enter Subject Name"
          />
        </div>
      </header>
    </div>
  );
}

export default function Resources() {
  return (
    <div className="flex flex-col items-center min-h-[70lvh] px-5">
      <h1 className="text-6xl max-xs:text-3xl max-sm:text-4xl max-md:text-5xl font-bold mt-32 mb-16 text-center">
        Resource Repository
      </h1>
      <Search />
    </div>
  );
}
