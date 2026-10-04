import DetailSection, { BulletList, Fact } from "@/components/scholarships/DetailSection";
import Markdown from "@/components/scholarships/Markdown";
import ScholarshipRow from "@/components/scholarships/ScholarshipRow";
import { cldImage } from "@/lib/cloudinary";
import { getSavedStatuses } from "@/lib/data/scholarship-saves";
import {
  getPublishedUniversity,
  getScholarshipsForUniversity,
  getUniversityForPreview,
} from "@/lib/data/scholarships";
import { getAuthSession } from "@/lib/getAuthSession";
import { hasScholarshipCmsAccess } from "@/lib/roles";
import {
  AID_BASIS_LABELS,
  AID_FORM_LABELS,
  AID_POLICY_DESCRIPTIONS,
  AID_POLICY_LABELS,
  TEST_POLICY_LABELS,
} from "@/lib/scholarships/constants";
import { countryName } from "@/lib/scholarships/countries";
import { formatDate, formatUsd, formatUsdShort } from "@/lib/scholarships/format";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const university = await getPublishedUniversity(slug);
  if (!university) return { title: "University | r/alevel" };
  return {
    title: `${university.name} financial aid | r/alevel`,
    description: `${AID_POLICY_LABELS[university.aidPolicy]}. ${AID_POLICY_DESCRIPTIONS[university.aidPolicy]}`,
  };
}

export default async function UniversityPage({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await getAuthSession();

  let university = await getPublishedUniversity(slug);
  let preview = false;
  if (!university && session && hasScholarshipCmsAccess(session.userData.roles)) {
    university = await getUniversityForPreview(slug);
    preview = Boolean(university);
  }
  if (!university) notFound();

  const scholarships = await getScholarshipsForUniversity(university.id);
  const statuses = session
    ? await getSavedStatuses(session.userData.id, scholarships.map((s) => s.id))
    : {};

  const place = [university.city, countryName(university.country)].filter(Boolean).join(", ");
  const stats = [
    university.avgAidUsd !== null && `${formatUsdShort(university.avgAidUsd)} average aid`,
    university.intlStudentsAided !== null &&
      `${university.intlStudentsAided.toLocaleString("en-US")} international students aided`,
    university.costOfAttendanceUsd !== null &&
      `${formatUsd(university.costOfAttendanceUsd)} cost / yr`,
  ].filter((s): s is string => Boolean(s));
  const links = [
    university.aidPageUrl && { label: "Financial aid page", url: university.aidPageUrl },
    university.netPriceCalculatorUrl && {
      label: "Net price calculator",
      url: university.netPriceCalculatorUrl,
    },
    university.website && { label: "Website", url: university.website },
  ].filter((l): l is { label: string; url: string } => Boolean(l));

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-12 tracking-normal sm:px-8">
      {preview && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Preview — this university is a {university.status} and isn&apos;t public.
        </p>
      )}

      <Link
        href="/scholarships/universities"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> All universities
      </Link>

      <header className="mt-6 flex items-start gap-4">
        {university.logo && (
          <Image
            src={cldImage(university.logo)}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-xl object-contain ring-1 ring-slate-200"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {university.name}
          </h1>
          <p className="mt-1.5 text-slate-500">{place}</p>
        </div>
      </header>

      {stats.length > 0 && (
        <p className="mt-5 text-sm text-slate-600">
          {stats.join(" · ")}
          {university.dataYear && (
            <span className="text-slate-400"> ({university.dataYear} data)</span>
          )}
        </p>
      )}

      <div className="mt-8 divide-y divide-slate-200 border-t border-slate-200">
        <DetailSection title="Financial aid">
          <div>
            <p className="font-medium text-slate-900">{AID_POLICY_LABELS[university.aidPolicy]}</p>
            <p className="mt-1 text-[15px] text-slate-700">
              {AID_POLICY_DESCRIPTIONS[university.aidPolicy]}
            </p>
          </div>
          {university.aidTypes.length > 0 && (
            <Fact label="Aid types">
              {university.aidTypes.map((t) => AID_BASIS_LABELS[t]).join(", ")}
            </Fact>
          )}
          {university.noLoans && <Fact label="Loans">None — aid is given as grants</Fact>}
          <BulletList items={university.highlights} />
          {university.description && <Markdown>{university.description}</Markdown>}
        </DetailSection>

        {(university.requiredForms.length > 0 || university.testPolicy !== "not_applicable") && (
          <DetailSection title="What you'll need">
            {university.requiredForms.length > 0 && (
              <Fact label="Aid forms">
                {university.requiredForms.map((f) => AID_FORM_LABELS[f]).join(", ")}
              </Fact>
            )}
            {university.testPolicy !== "not_applicable" && (
              <Fact label="Tests">{TEST_POLICY_LABELS[university.testPolicy]}</Fact>
            )}
          </DetailSection>
        )}

        {university.deadlines.length > 0 && (
          <DetailSection title="Deadlines">
            <ul className="space-y-1 text-[15px] text-slate-700">
              {university.deadlines.map((d) => (
                <li key={`${d.label}-${d.date}`}>
                  <span className="text-slate-500">{d.label}: </span>
                  {formatDate(d.date, { withYear: true })}
                </li>
              ))}
            </ul>
          </DetailSection>
        )}

        {scholarships.length > 0 && (
          <DetailSection title="Scholarships">
            <ul className="-mt-5 divide-y divide-slate-100">
              {scholarships.map((s) => (
                <ScholarshipRow
                  key={s.id}
                  scholarship={s}
                  signedIn={Boolean(session)}
                  saveState={
                    statuses[s.id] ? { status: statuses[s.id], completedRequirementIds: [] } : null
                  }
                />
              ))}
            </ul>
          </DetailSection>
        )}

        {links.length > 0 && (
          <DetailSection title="Links">
            <ul className="space-y-1">
              {links.map((link) => (
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
          </DetailSection>
        )}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        {university.lastVerifiedAt
          ? `Last verified ${formatDate(university.lastVerifiedAt, { withYear: true })}`
          : "Always confirm details on the university's website"}
      </p>
    </article>
  );
}
