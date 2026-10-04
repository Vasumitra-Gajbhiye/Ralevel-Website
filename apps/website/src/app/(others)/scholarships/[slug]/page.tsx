import DeadlinePill from "@/components/scholarships/DeadlinePill";
import DetailSection, { BulletList, Fact } from "@/components/scholarships/DetailSection";
import EligibilityLine from "@/components/scholarships/EligibilityLine";
import Markdown from "@/components/scholarships/Markdown";
import RequirementsChecklist from "@/components/scholarships/RequirementsChecklist";
import { SaveStateProvider } from "@/components/scholarships/SaveState";
import { fundingText } from "@/components/scholarships/ScholarshipRow";
import StickyApplyBar from "@/components/scholarships/StickyApplyBar";
import SuggestDialog from "@/components/scholarships/SuggestDialog";
import { cldImage } from "@/lib/cloudinary";
import { getSaveState } from "@/lib/data/scholarship-saves";
import {
  getPublishedScholarship,
  getScholarshipForPreview,
} from "@/lib/data/scholarships";
import { getStudyPlans } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import { hasScholarshipCmsAccess } from "@/lib/roles";
import {
  AID_BASIS_LABELS,
  COVER_LABELS,
  FIELD_OF_STUDY_LABELS,
  STUDY_LEVEL_LABELS,
} from "@/lib/scholarships/constants";
import { countryName } from "@/lib/scholarships/countries";
import { formatDate, formatDestinations } from "@/lib/scholarships/format";
import { getDeadlineState } from "@/lib/scholarships/status";
import type { ScholarshipDetail } from "@/types/scholarships";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await getPublishedScholarship(slug);
  if (!scholarship) return { title: "Scholarship | r/alevel" };
  return {
    title: `${scholarship.title} | Scholarships | r/alevel`,
    description: scholarship.summary || `${scholarship.title} from ${scholarship.provider}.`,
  };
}

const NATIONALITY_PREVIEW = 8;

function NationalityRule({ rule }: { rule: ScholarshipDetail["nationality"] }) {
  if (rule.mode === "any") {
    return <Fact label="Nationality">Open to all nationalities</Fact>;
  }
  const names = rule.countries.map(countryName).sort();
  const prefix = rule.mode === "include" ? "Citizens of" : "Everyone except citizens of";
  const shown = names.slice(0, NATIONALITY_PREVIEW).join(", ");
  const rest = names.slice(NATIONALITY_PREVIEW);

  return (
    <div className="text-[15px] text-slate-700">
      <span className="text-slate-500">Nationality: </span>
      {prefix} {shown}
      {rest.length > 0 && (
        <details className="inline">
          <summary className="inline cursor-pointer text-blue-600 hover:text-blue-700">
            {" "}
            and {rest.length} more
          </summary>
          <span>, {rest.join(", ")}</span>
        </details>
      )}
      {rule.note && <p className="mt-1 text-sm text-slate-500">{rule.note}</p>}
    </div>
  );
}

function JsonLd({ scholarship }: { scholarship: ScholarshipDetail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "MonetaryGrant",
    name: scholarship.title,
    description: scholarship.summary || undefined,
    url: `https://ralevel.com/scholarships/${scholarship.slug}`,
    funder: { "@type": "Organization", name: scholarship.provider },
    ...(scholarship.officialUrl ? { sameAs: scholarship.officialUrl } : {}),
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can't close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function ScholarshipPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await getAuthSession();

  let scholarship = await getPublishedScholarship(slug);
  let preview = false;
  if (!scholarship && session && hasScholarshipCmsAccess(session.userData.roles)) {
    scholarship = await getScholarshipForPreview(slug);
    preview = Boolean(scholarship);
  }
  if (!scholarship) notFound();

  const [plans, saveState] = await Promise.all([
    session ? getStudyPlans() : null,
    session && !preview ? getSaveState(session.userData.id, scholarship.id) : null,
  ]);

  const deadline = getDeadlineState(scholarship);
  const destinations = formatDestinations(scholarship.destinations, 3);
  const facts = [
    fundingText(scholarship),
    ...scholarship.studyLevels.map((l) => STUDY_LEVEL_LABELS[l]),
    ...(scholarship.renewable ? ["Renewable"] : []),
  ];
  const applyUrl = scholarship.applyUrl || scholarship.officialUrl;
  const keyDates = [
    scholarship.opensAt && `Opens ${formatDate(scholarship.opensAt, { withYear: true })}`,
    scholarship.deadline && `Deadline ${formatDate(scholarship.deadline, { withYear: true })}`,
    scholarship.resultsAt && `Results ${formatDate(scholarship.resultsAt, { withYear: true })}`,
  ].filter((d): d is string => Boolean(d));

  const hasAbout =
    scholarship.summary ||
    scholarship.description ||
    scholarship.covers.length > 0 ||
    scholarship.universities.length > 0;
  const hasHowToApply =
    scholarship.requirements.length > 0 ||
    scholarship.applySteps.length > 0 ||
    scholarship.extraLinks.length > 0;

  return (
    <SaveStateProvider
      scholarshipId={scholarship.id}
      initialState={saveState}
      signedIn={Boolean(session)}
    >
      {!preview && <JsonLd scholarship={scholarship} />}
      <article className="mx-auto max-w-3xl px-5 pb-40 pt-12 tracking-normal sm:px-8">
        {preview && (
          <p className="mb-6 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Preview — this scholarship is a {scholarship.status} and isn&apos;t public.
          </p>
        )}

        <Link
          href="/scholarships"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> All scholarships
        </Link>

        <header className="mt-6 flex items-start gap-4">
          {scholarship.logo && (
            <Image
              src={cldImage(scholarship.logo)}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-xl object-contain ring-1 ring-slate-200"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              {scholarship.title}
            </h1>
            <p className="mt-1.5 text-slate-500">
              {scholarship.provider}
              {destinations && ` · ${destinations}`}
            </p>
          </div>
        </header>

        <p className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-600">
          {facts.map((fact) => (
            <span key={fact} className="after:ml-1.5 after:text-slate-300 after:content-['·']">
              {fact}
            </span>
          ))}
          <DeadlinePill state={deadline} />
        </p>

        <div className="mt-8 divide-y divide-slate-200 border-t border-slate-200">
          {hasAbout && (
            <DetailSection title="About">
              {scholarship.summary && (
                <p className="text-[15px] leading-relaxed text-slate-800">{scholarship.summary}</p>
              )}
              {scholarship.description && <Markdown>{scholarship.description}</Markdown>}
              {scholarship.covers.length > 0 && (
                <Fact label="Covers">
                  {scholarship.covers.map((c) => COVER_LABELS[c]).join(", ")}
                </Fact>
              )}
              {scholarship.fundingType === "full" && scholarship.amountText && (
                <Fact label="Worth">{scholarship.amountText}</Fact>
              )}
              {scholarship.durationYears && (
                <Fact label="Duration">
                  {scholarship.durationYears} {scholarship.durationYears === 1 ? "year" : "years"}
                </Fact>
              )}
              {scholarship.universities.length > 0 && (
                <Fact label="Offered at">
                  {scholarship.universities.map((u, i) => (
                    <span key={u.slug}>
                      {i > 0 && ", "}
                      <Link
                        href={`/scholarships/universities/${u.slug}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {u.name}
                      </Link>
                    </span>
                  ))}
                </Fact>
              )}
            </DetailSection>
          )}

          <DetailSection title="Who can apply">
            <EligibilityLine scholarship={scholarship} plans={plans} signedIn={Boolean(session)} />
            <div className="space-y-2">
              <NationalityRule rule={scholarship.nationality} />
              {scholarship.fieldsOfStudy.length > 0 && (
                <Fact label="Fields">
                  {scholarship.fieldsOfStudy.map((f) => FIELD_OF_STUDY_LABELS[f]).join(", ")}
                </Fact>
              )}
              {scholarship.basis.length > 0 && (
                <Fact label="Awarded for">
                  {scholarship.basis.map((b) => AID_BASIS_LABELS[b]).join(" and ").toLowerCase()}
                </Fact>
              )}
              {scholarship.minGrades && <Fact label="Grades">{scholarship.minGrades}</Fact>}
            </div>
            <BulletList items={scholarship.otherCriteria} />
            {scholarship.selectionCriteria.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-900">How they choose</p>
                <BulletList items={scholarship.selectionCriteria} />
              </div>
            )}
          </DetailSection>

          {hasHowToApply && (
            <DetailSection title="How to apply">
              <RequirementsChecklist requirements={scholarship.requirements} />
              {scholarship.applySteps.length > 0 && (
                <ol className="space-y-3">
                  {scholarship.applySteps.map((step, i) => (
                    <li key={`${i}-${step.title}`} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {i + 1}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[15px] text-slate-800">{step.title}</p>
                        {step.detail && <p className="text-sm text-slate-500">{step.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {scholarship.extraLinks.length > 0 && (
                <ul className="space-y-1">
                  {scholarship.extraLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-blue-600 hover:text-blue-700"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          )}

          {(keyDates.length > 0 || scholarship.deadlineNote || scholarship.rolling) && (
            <DetailSection title="Key dates">
              {keyDates.length > 0 && (
                <p className="text-[15px] text-slate-800">{keyDates.join(" · ")}</p>
              )}
              {scholarship.rolling && (
                <p className="text-[15px] text-slate-700">
                  Applications are reviewed on a rolling basis — apply early.
                </p>
              )}
              {scholarship.deadlineNote && (
                <p className="text-sm text-slate-500">{scholarship.deadlineNote}</p>
              )}
              {scholarship.recurring && (
                <p className="text-sm text-slate-500">Runs every year.</p>
              )}
            </DetailSection>
          )}
        </div>

        <p className="mt-10 text-sm text-slate-500">
          {scholarship.lastVerifiedAt
            ? `Last verified ${formatDate(scholarship.lastVerifiedAt, { withYear: true })}`
            : "Always confirm details on the official site"}{" "}
          ·{" "}
          <SuggestDialog
            signedIn={Boolean(session)}
            triggerLabel="Report outdated info"
            correction={{ scholarshipId: scholarship.id, title: scholarship.title }}
          />
        </p>
      </article>

      <StickyApplyBar
        scholarshipId={scholarship.id}
        applyUrl={applyUrl}
        deadlineLabel={deadline.label}
      />
    </SaveStateProvider>
  );
}
