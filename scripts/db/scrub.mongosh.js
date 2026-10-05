// Runs inside mongosh against the seed staging database (see export-seed.ts).
// Replaces every `email` field (at any depth) with a placeholder, then reports
// any remaining strings that look like email addresses so the owner can check
// them before sharing the archive.

const PLACEHOLDER = "redacted@example.com";
const EMAIL_LIKE = /[^\s@"'<>()]+@[^\s@"'<>()]+\.[a-z]{2,}/i;

// Documents from mongosh don't share this realm's Object.prototype, so check
// the type tag instead, and skip BSON values (ObjectId, Decimal128, ...).
function isPlainObject(v) {
  return (
    v !== null &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    v._bsontype === undefined &&
    Object.prototype.toString.call(v) === "[object Object]"
  );
}

// Returns true if anything was changed.
function scrub(value) {
  let changed = false;
  if (Array.isArray(value)) {
    for (const item of value) changed = scrub(item) || changed;
  } else if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (key === "email" && typeof value[key] === "string" && value[key] !== PLACEHOLDER) {
        value[key] = PLACEHOLDER;
        changed = true;
      } else {
        changed = scrub(value[key]) || changed;
      }
    }
  }
  return changed;
}

// Collects paths of strings that still look like email addresses.
function findEmailLike(value, path, hits) {
  if (typeof value === "string") {
    if (value !== PLACEHOLDER && EMAIL_LIKE.test(value)) hits.push(path);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => findEmailLike(item, `${path}[${i}]`, hits));
  } else if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      findEmailLike(value[key], path ? `${path}.${key}` : key, hits);
    }
  }
}

for (const name of db.getCollectionNames().sort()) {
  const coll = db.getCollection(name);
  let docs = 0;
  let scrubbed = 0;
  const hits = [];

  coll.find().forEach((doc) => {
    docs++;
    if (scrub(doc)) {
      coll.replaceOne({ _id: doc._id }, doc);
      scrubbed++;
    }
    findEmailLike(doc, "", hits);
  });

  let line = `  ${name}: ${docs} docs`;
  if (scrubbed) line += `, ${scrubbed} with email fields redacted`;
  print(line);
  if (hits.length) {
    const unique = [...new Set(hits.map((p) => p.replace(/\[\d+\]/g, "[]")))];
    print(`    ⚠️  ${hits.length} email-like strings left at: ${unique.slice(0, 5).join(", ")}`);
  }
}
