import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

// Quiet in production — Coolify injects env into process.env; missing .env
// files previously logged "injected env (0)" and looked like a config failure.
const quiet = process.env.NODE_ENV === "production";

dotenv.config({ path: path.join(repoRoot, ".env"), quiet });
dotenv.config({ path: path.join(repoRoot, ".env.local"), quiet });
dotenv.config({ path: path.join(__dirname, "../.env"), quiet });
dotenv.config({ path: path.join(__dirname, "../.env.local"), quiet });
