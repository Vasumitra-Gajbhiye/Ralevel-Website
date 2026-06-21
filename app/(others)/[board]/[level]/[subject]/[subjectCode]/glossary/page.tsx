import {
  getGlossaryTerms,
  getSubjectPathsForStaticParams,
} from "@/lib/data/curriculum";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const revalidate = 86400;

export async function generateStaticParams() {
  return getSubjectPathsForStaticParams();
}

type Params = {
  board: string;
  level: string;
  subject: string;
  subjectCode: string;
};

export default async function ChapterGlossary({
  params,
}: {
  params: Promise<Params>;
}) {
  const { board, level, subject, subjectCode } = await params;

  const terms = await getGlossaryTerms(board, level, subject, subjectCode);

  const sortedTerms = [...terms].sort((a: any, b: any) =>
    (a.term || "").localeCompare(b.term || "")
  );

  const alphabetGroups: Record<string, any[]> = {};

  for (const term of sortedTerms) {
    const letter = term.term?.[0]?.toUpperCase() || "#";

    if (!alphabetGroups[letter]) alphabetGroups[letter] = [];

    alphabetGroups[letter].push(term);
  }

  const letters = Object.keys(alphabetGroups).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 mt-12">
      <Breadcrumb className="my-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}`}>{board}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${level}`}>{level}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${board}/${level}/${subject}/${subjectCode}`}>
                {subject} {subjectCode}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Glossary</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-4xl font-semibold tracking-tight mb-10">
        {subject.toUpperCase()} {subjectCode} Glossary
      </h1>

      <p className="text-muted-foreground mb-12 max-w-2xl">
        Key physics terms used throughout the syllabus. Definitions follow the
        Cambridge-style glossary format to help you quickly revise important
        concepts.
      </p>

      <div className="mb-10">
        <Input
          placeholder="Search glossary terms"
          list="glossary-suggestions"
          className="max-w-xl rounded-full focus-visible:ring-cyan-500"
        />

        <datalist id="glossary-suggestions">
          {sortedTerms.map((term: any) => (
            <option key={term.slug} value={term.term} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-wrap gap-3 mb-12 text-sm font-medium">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className="text-muted-foreground hover:text-cyan-600 cursor-pointer"
          >
            {letter}
          </a>
        ))}
      </div>

      <div className="space-y-16">
        {letters.map((letter) => {
          const group = alphabetGroups[letter];
          return (
            <div id={letter} key={letter} className="flex gap-10 scroll-mt-24">
              <div className="text-4xl font-bold w-12">{letter}</div>

              <div className="flex-1 space-y-4">
                {group
                  .sort((a, b) => a.term.localeCompare(b.term))
                  .map((term: any) => (
                    <Card
                      key={term.slug}
                      className="border transition-colors hover:border-cyan-500"
                    >
                      <CardContent className="p-5">
                        <h3 className="text-lg font-semibold text-cyan-600">
                          {term.term}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                          {term.definition}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
