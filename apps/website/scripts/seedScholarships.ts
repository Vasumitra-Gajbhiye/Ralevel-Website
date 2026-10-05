/**
 * Seed the Scholarship Hub with starter scholarships and universities.
 *
 * Usage:
 *   npx tsx scripts/seedScholarships.ts --dry-run   # validate only, no database
 *   npx tsx scripts/seedScholarships.ts             # insert into the local dev DB
 *   npx tsx scripts/seedScholarships.ts --prod      # owner only: production
 *
 * Safe to re-run: records whose slug already exists are skipped (never
 * overwritten), so edits made in the admin are kept. New records are drafts
 * flagged "needs verification" and stay hidden until someone publishes them.
 */
import "dotenv/config";

import { resolveScriptMongoUri } from "../../../scripts/db/guard";

import {
  scholarshipInputToDoc,
  universityInputToDoc,
} from "../src/lib/scholarships/serialize";
import {
  emptyScholarshipInput,
  emptyUniversityInput,
  firstIssue,
  scholarshipInputSchema,
  universityInputSchema,
  type ScholarshipInput,
  type UniversityInput,
} from "../src/lib/validation/scholarships";
import { SEED_SCHOLARSHIPS, SEED_UNIVERSITIES } from "./data/scholarship-seed";

type Validated<T> = { slug: string; input: T; universitySlugs: string[] };

function validate() {
  const errors: string[] = [];
  const universities: Validated<UniversityInput>[] = [];
  const scholarships: Validated<ScholarshipInput>[] = [];

  for (const seed of SEED_UNIVERSITIES) {
    const parsed = universityInputSchema.safeParse({ ...emptyUniversityInput(), ...seed, status: "draft" });
    if (parsed.success) universities.push({ slug: seed.slug, input: parsed.data, universitySlugs: [] });
    else errors.push(`University "${seed.slug}": ${firstIssue(parsed.error)}`);
  }

  const knownUniversities = new Set(SEED_UNIVERSITIES.map((u) => u.slug));
  for (const { universitySlugs = [], requirements = [], applySteps = [], ...seed } of SEED_SCHOLARSHIPS) {
    const missing = universitySlugs.filter((s) => !knownUniversities.has(s));
    if (missing.length) errors.push(`Scholarship "${seed.slug}": unknown universities ${missing.join(", ")}`);

    const parsed = scholarshipInputSchema.safeParse({
      ...emptyScholarshipInput(),
      ...seed,
      requirements: requirements.map((r) => ({ label: r.label, detail: r.detail ?? "" })),
      applySteps: applySteps.map((s) => ({ title: s.title, detail: s.detail ?? "" })),
      status: "draft",
    });
    if (parsed.success) scholarships.push({ slug: seed.slug, input: parsed.data, universitySlugs });
    else errors.push(`Scholarship "${seed.slug}": ${firstIssue(parsed.error)}`);
  }

  const dupes = (slugs: string[]) => slugs.filter((s, i) => slugs.indexOf(s) !== i);
  for (const slug of dupes(SEED_SCHOLARSHIPS.map((s) => s.slug))) errors.push(`Duplicate scholarship slug "${slug}"`);
  for (const slug of dupes(SEED_UNIVERSITIES.map((u) => u.slug))) errors.push(`Duplicate university slug "${slug}"`);

  return { errors, universities, scholarships };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const { errors, universities, scholarships } = validate();

  if (errors.length) {
    console.error(`Seed data has ${errors.length} problem(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(`Seed data OK: ${scholarships.length} scholarships, ${universities.length} universities.`);
  if (dryRun) return;

  await resolveScriptMongoUri(); // local dev DB only, unless --prod
  // Imported lazily so --dry-run works without MONGODB_URI.
  const { default: connectDB } = await import("../src/lib/mongodb");
  const { default: University } = await import("../src/models/university");
  const { default: Scholarship } = await import("../src/models/scholarship");
  const mongoose = (await import("mongoose")).default;

  await connectDB();
  const seedMeta = { status: "draft", needsVerification: true, source: "seed" };

  let universitiesAdded = 0;
  for (const { slug, input } of universities) {
    const result = await University.updateOne(
      { slug },
      { $setOnInsert: { ...universityInputToDoc(input), ...seedMeta } },
      { upsert: true },
    );
    universitiesAdded += result.upsertedCount;
  }

  const idBySlug = new Map(
    (await University.find({}).select("slug").lean<{ _id: unknown; slug: string }[]>()).map((u) => [
      u.slug,
      String(u._id),
    ]),
  );

  let scholarshipsAdded = 0;
  for (const { slug, input, universitySlugs } of scholarships) {
    const universityIds = universitySlugs.flatMap((s) => idBySlug.get(s) ?? []);
    const result = await Scholarship.updateOne(
      { slug },
      { $setOnInsert: { ...scholarshipInputToDoc({ ...input, universityIds }), ...seedMeta } },
      { upsert: true },
    );
    scholarshipsAdded += result.upsertedCount;
  }

  console.log(
    `Added ${scholarshipsAdded} scholarships and ${universitiesAdded} universities as drafts ` +
      `(${scholarships.length - scholarshipsAdded + universities.length - universitiesAdded} already existed and were left alone).`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
