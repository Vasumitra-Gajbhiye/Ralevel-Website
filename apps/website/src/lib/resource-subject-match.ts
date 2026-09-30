import { parseSubjectKey } from "@/components/profile/profile-utils";

// Board subject names (after normalizing) that differ from the resource page subject.
const ALIASES: Record<string, string> = {
  "business studies": "business",
  "literature in english": "english literature",
  "computing / computer science": "computer science",
  "fine art": "art and design",
  "art, craft and design": "art and design",
  "drama and theatre": "drama",
  "applied ict": "information technology",
  it: "information technology",
  "environmental management": "environmental studies",
  "environmental science": "environmental studies",
  "politics / government and politics": "politics",
};

// "Chemistry B (Salters)" -> "chemistry", "Art & Design" -> "art and design"
function normalize(name: string) {
  const base = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s[ab]$/, "");
  return ALIASES[base] ?? base;
}

/** Map profile subject keys ("BOARD::CODE::Name") to resource slugs, in profile order. */
export function matchProfileSubjects(
  keys: string[],
  subjects: { subject: string; slug: string }[],
): string[] {
  const slugByName = new Map(subjects.map((s) => [normalize(s.subject), s.slug]));
  const slugs = keys
    .map((key) => slugByName.get(normalize(parseSubjectKey(key).name)))
    .filter((slug): slug is string => Boolean(slug));
  return Array.from(new Set(slugs));
}
