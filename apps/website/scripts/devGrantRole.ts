/**
 * pnpm dev:grant-role <email> <role…>
 * pnpm dev:grant-role <email> --clear
 *
 * Gives a user roles in YOUR local setup: adds them to the user's UserData in
 * the local dev database and copies them to your own Clerk app's user metadata,
 * so the site picks them up on the next page load. `--clear` removes all roles.
 *
 * Sign up on http://localhost:3000 first. If the Clerk user doesn't exist yet,
 * the roles are saved locally and applied the first time you sign in.
 *
 * Refuses to run unless MONGODB_URI is the local dev database and
 * CLERK_SECRET_KEY is a Development key (sk_test_).
 */
import { WEBSITE_ENV_LOCAL } from "../../../scripts/db/config";
import { readEnvFile, resolveLocalMongoUri } from "../../../scripts/db/guard";
import { ROLES, sanitizeRoles } from "../src/lib/roles";

const USAGE =
  "Usage: pnpm dev:grant-role <email> <role…>\n" +
  "       pnpm dev:grant-role <email> --clear";

async function main() {
  const args = process.argv.slice(2);
  const clear = args.includes("--clear");
  const [rawEmail, ...requested] = args.filter((a) => a !== "--clear");
  const email = rawEmail?.trim().toLowerCase();
  const rolesGiven = requested.length > 0;
  if (!email?.includes("@") || (clear ? rolesGiven : !rolesGiven)) {
    throw new Error(USAGE);
  }

  const validRoles: readonly string[] = ROLES;
  const unknown = requested.filter((r) => !validRoles.includes(r));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown role(s): ${unknown.join(", ")}\nValid roles: ${ROLES.join(", ")}`,
    );
  }

  resolveLocalMongoUri();
  const clerkKey =
    process.env.CLERK_SECRET_KEY?.trim() ||
    readEnvFile(WEBSITE_ENV_LOCAL, "CLERK_SECRET_KEY");
  if (!clerkKey?.startsWith("sk_test_")) {
    throw new Error(
      "Refusing to run: CLERK_SECRET_KEY must be a Development key (sk_test_…).",
    );
  }
  process.env.CLERK_SECRET_KEY = clerkKey;

  // Imported after the guards: lib/mongodb reads MONGODB_URI at import time.
  const { default: connectDB } = await import("../src/lib/mongodb");
  const { default: mongoose } = await import("mongoose");
  const { default: UserData } = await import("../src/models/userData");
  const { findClerkUserIdByEmail, syncClerkUserMetadata } = await import(
    "../src/lib/syncClerkUserMetadata"
  );

  await connectDB();
  try {
    let user = await UserData.findOne({ email });
    if (!user) {
      user = await UserData.create({ name: "", email, roles: [] });
      console.log(`Created a local UserData for ${email}`);
    }
    const roles = clear
      ? []
      : sanitizeRoles([...new Set([...(user.roles ?? []), ...requested])]);
    user.roles = roles;
    await user.save();

    const clerkUserId = await findClerkUserIdByEmail(email);
    if (clerkUserId) {
      await syncClerkUserMetadata(clerkUserId, {
        roles,
        userDataId: user._id.toString(),
      });
    }

    console.log(
      `✅ ${email} now has: ${roles.length > 0 ? roles.join(", ") : "(no roles)"}`,
    );
    console.log(
      clerkUserId
        ? "Reload the page to see the change."
        : "⚠️  No Clerk user with this email yet. Sign up, and the roles apply on first sign-in.",
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
