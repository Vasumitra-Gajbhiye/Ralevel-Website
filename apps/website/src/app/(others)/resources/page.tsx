import CardRow from "@/components/resources/CardRow";
import FeaturedCard from "@/components/resources/FeaturedCard";
import SubjectCard from "@/components/resources/SubjectCard";
import SubjectSearch from "@/components/resources/SubjectSearch";
import {
  getCachedResourceSubjects,
  getCachedResourcesHomepage,
} from "@/lib/data/resources-homepage";
import { getUserProfile } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import { matchProfileSubjects } from "@/lib/resource-subject-match";
import Link from "next/link";

async function getProfileSubjectKeys() {
  const session = await getAuthSession();
  if (!session) return null;
  const profile = await getUserProfile();
  return [...(profile?.subjectsA2 ?? []), ...(profile?.subjectsAS ?? [])];
}

export default async function Resources() {
  const [subjects, homepage, profileKeys] = await Promise.all([
    getCachedResourceSubjects(),
    getCachedResourcesHomepage(),
    getProfileSubjectKeys(),
  ]);

  const bySlug = new Map(subjects.map((s) => [s.slug, s]));
  const pick = (slugs: string[]) =>
    slugs.flatMap((slug) => bySlug.get(slug) ?? []);

  const yourSubjects = pick(matchProfileSubjects(profileKeys ?? [], subjects));
  const popularSubjects = pick(homepage.popularSlugs);
  const signedIn = profileKeys !== null;

  const linkClass = "font-medium text-slate-900 underline underline-offset-2";

  return (
    <div className="flex flex-col items-center min-h-[70lvh] px-5 pb-24">
      <h1 className="text-6xl max-xs:text-3xl max-sm:text-4xl max-md:text-5xl font-bold mt-32 mb-16 text-center">
        Resource Repository
      </h1>
      <SubjectSearch subjects={subjects} />

      <div className="mt-20 w-full max-w-6xl space-y-14">
        {yourSubjects.length > 0 ? (
          <CardRow
            title="Your subjects"
            subtitle={
              <>
                Based on your{" "}
                <Link href="/profile" className={linkClass}>
                  profile
                </Link>
              </>
            }
          >
            {yourSubjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} />
            ))}
          </CardRow>
        ) : (
          popularSubjects.length > 0 && (
            <CardRow
              title="Popular subjects"
              subtitle={
                signedIn ? (
                  <>
                    <Link href="/profile" className={linkClass}>
                      Add your subjects
                    </Link>{" "}
                    to see them here.
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in?redirect_url=/resources"
                      className={linkClass}
                    >
                      Sign in
                    </Link>{" "}
                    to see your subjects here.
                  </>
                )
              }
            >
              {popularSubjects.map((subject) => (
                <SubjectCard key={subject.slug} subject={subject} />
              ))}
            </CardRow>
          )
        )}

        {homepage.featured.length > 0 && (
          <CardRow title="Featured">
            {homepage.featured.map((card, index) => (
              <FeaturedCard key={`${card.href}-${index}`} card={card} />
            ))}
          </CardRow>
        )}
      </div>
    </div>
  );
}
