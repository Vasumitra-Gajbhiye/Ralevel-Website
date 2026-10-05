/**
 * Collections copied from production into the seed archive. Content only:
 * nothing here may hold personal data (emails, Discord IDs, submissions...).
 * Personal collections get fake data from `pnpm db:seed-fake` instead.
 *
 * These are MongoDB collection names, not model names. Check a new one with
 * `mongoose.model("<Model>").collection.collectionName`.
 */
export const SEED_COLLECTIONS = [
  "topics", // Topic
  "mcqs", // MCQ
  "glossaries", // Glossary
  "subjectguides", // SubjectGuide
  "resourcesdatas", // ResourcesData
  "resources2datas", // resources2data
  "resourceshomepages", // ResourcesHomepage
  "blogsdatas", // BlogsData
  "blogv2", // BlogV2 (explicit collection name)
  "blogv2versions", // BlogV2Version
  "editorblogs", // EditorBlog
  "legalpages", // LegalPage
  "scholarships", // Scholarship
  "universities", // University
  "forms", // Form
  "formindexes", // FormIndex
  "campaigns", // Campaign
  "scheduleitems", // ScheduleItem
  "teamdatas", // TeamData: public homepage team (name, title, links)
] as const;
