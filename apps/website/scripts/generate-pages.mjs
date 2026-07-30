// import fs from "fs";
// import path from "path";

// // ✅ Path to your subject.json
// const subjectPath = path.join(process.cwd(), "app/(others)/subject_guide/physics/subject.json");

// // ✅ Output base folder
// const baseDir = path.join(process.cwd(), "app/(others)/subject_guide/physics");

// const data = JSON.parse(fs.readFileSync(subjectPath, "utf-8"));

// function formatName(str) {
//   return str.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "-");
// }

// function ensureDir(dir) {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// }

// // ✅ Simple default page content
// function createPageContent(title, pathParts) {
//   const fullPath = pathParts.join(" → ");
//   return `export default function Page() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-2">${title}</h1>
//       <p>This is the page for <strong>${fullPath}</strong>.</p>
//     </div>
//   );
// }`;
// }

// data.chapters.forEach((chapter) => {
//   const chapterDir = path.join(baseDir, formatName(chapter.title));
//   ensureDir(chapterDir);

//   chapter.topics.forEach((topic) => {
//     const topicDir = path.join(chapterDir, formatName(topic.title));
//     ensureDir(topicDir);

//     topic.subtopics.forEach((sub) => {
//       const subDir = path.join(topicDir, formatName(sub));
//       ensureDir(subDir);

//       const filePath = path.join(subDir, "page.tsx");

//       if (!fs.existsSync(filePath)) {
//         fs.writeFileSync(
//           filePath,
//           createPageContent(sub, [chapter.title, topic.title, sub]),
//           "utf-8"
//         );
//       }
//     });
//   });
// });

// console.log("✅ All folders and pages generated successfully!");


// import fs from "fs";
// import path from "path";

// // ✅ Path to your subject.json
// const subjectPath = path.join(process.cwd(), "app/(others)/subject_guide/physics/subject.json");

// // ✅ Output base folder
// const baseDir = path.join(process.cwd(), "app/(others)/subject_guide/physics");

// const data = JSON.parse(fs.readFileSync(subjectPath, "utf-8"));

// // ✅ Sanitize folder names: only lowercase letters, numbers, _ and -
// function formatName(str) {
//   return str
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, "_") // convert spaces to underscores
//     .replace(/[^\w-]/g, ""); // remove everything except letters, digits, _ and -
// }

// function ensureDir(dir) {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// }

// // ✅ Simple default page content
// function createPageContent(title, pathParts) {
//   const fullPath = pathParts.join(" → ");
//   return `export default function Page() {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-2">${title}</h1>
//       <p>This is the page for <strong>${fullPath}</strong>.</p>
//     </div>
//   );
// }`;
// }

// data.chapters.forEach((chapter) => {
//   const chapterDir = path.join(baseDir, formatName(chapter.title));
//   ensureDir(chapterDir);

//   chapter.topics.forEach((topic) => {
//     const topicDir = path.join(chapterDir, formatName(topic.title));
//     ensureDir(topicDir);

//     topic.subtopics.forEach((sub) => {
//       const subDir = path.join(topicDir, formatName(sub));
//       ensureDir(subDir);

//       const filePath = path.join(subDir, "page.tsx");

//       if (!fs.existsSync(filePath)) {
//         fs.writeFileSync(
//           filePath,
//           createPageContent(sub, [chapter.title, topic.title, sub]),
//           "utf-8"
//         );
//       }
//     });
//   });
// });

// console.log("✅ All folders and pages generated successfully!");

// scripts/generatePages.mjs
import fs from "fs";
import path from "path";

const subjectPath = path.join(process.cwd(), "app/(others)/subject_guide/physics/subject.json");
const baseDir = path.join(process.cwd(), "app/(others)/subject_guide/physics");

// Sanitize function (same logic as frontend)
function sanitizeForUrl(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[\/\\]+/g, "-")
    .replace(/[:=@]+/g, "_")
    .replace(/[()[\]{}"“”'’`%$€₹¢•†·•—–]/g, "")
    .replace(/[.,;?!‽…]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^[_-]+|[_-]+$/g, "");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createPageContent(title, pathParts) {
  const fullPath = pathParts.join(" → ");
  return `export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">${title}</h1>
      <p>This is the page for <strong>${fullPath}</strong>.</p>
    </div>
  );
}
`;
}

// read json
if (!fs.existsSync(subjectPath)) {
  console.error("subject.json not found at:", subjectPath);
  process.exit(1);
}

const raw = fs.readFileSync(subjectPath, "utf-8");
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error("Failed to parse subject.json:", err);
  process.exit(1);
}

data.chapters.forEach((chapter) => {
  const chapterDir = path.join(baseDir, sanitizeForUrl(chapter.title));
  ensureDir(chapterDir);

  chapter.topics.forEach((topic) => {
    const topicDir = path.join(chapterDir, sanitizeForUrl(topic.title));
    ensureDir(topicDir);

    topic.subtopics.forEach((sub) => {
      const subDir = path.join(topicDir, sanitizeForUrl(sub));
      ensureDir(subDir);

      const filePath = path.join(subDir, "page.tsx");
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          createPageContent(sub, [chapter.title, topic.title, sub]),
          "utf-8"
        );
      }
    });
  });
});

console.log("✅ All folders and pages generated successfully!");