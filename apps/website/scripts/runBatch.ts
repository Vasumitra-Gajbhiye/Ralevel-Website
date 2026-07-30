import { execSync } from "child_process";

const startChapter = 5;
const endChapter = 11;
const jsonPath = "lib/syllabusJson/cambridge/physics9702.json";

console.log(
  `Starting batch generation for chapters ${startChapter} to ${endChapter}...`
);

for (let i = startChapter; i <= endChapter; i++) {
  console.log(`\n========================================`);
  console.log(` Executing Chapter ${i}`);
  console.log(`========================================\n`);

  try {
    // stdio: 'inherit' ensures you see the console.logs from your generateNotes script in real-time
    execSync(`npx tsx scripts/generateNotes.ts ${jsonPath} ${i}`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(
      `\n❌ Error encountered at chapter ${i}. Batch process stopped so you can investigate.`
    );
    process.exit(1);
  }
}

console.log("\n✅ All chapters completed successfully!");
