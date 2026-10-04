// app/api/user/update/route.js
import { enforceSameOrigin } from "@/lib/csrf";
import { BOARDS } from "@/lib/exam-constants";
import { FIELDS_OF_STUDY } from "@/lib/scholarships/constants";
import { isCountryCode } from "@/lib/scholarships/countries";
import { getAuthSession } from "@/lib/getAuthSession";
import connectDB from "@/lib/mongodb";
import { invalidateUserCache } from "@/lib/redis-cache";
import UserData from "@/models/userData";
import { NextResponse } from "next/server";

const NAME_MAX = 50;
const USERNAME_MAX = 40;
const LIST_MAX = 40;
const ITEM_MAX = 120;
const BOARD_KEYS = new Set(BOARDS.map((b) => b.key));
const FIELD_KEYS = new Set(FIELDS_OF_STUDY);
const MAX_NATIONALITIES = 2;
const MAX_DESTINATIONS = 15;

// Unique, trimmed, non-empty strings of a sane length.
function cleanList(value) {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item && item.length <= ITEM_MAX);
  return [...new Set(items)].slice(0, LIST_MAX);
}

function cleanUsername(value) {
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, USERNAME_MAX);
}

export async function POST(req) {
  try {
    // 1) Ensure user is authenticated and derive identity from the session
    const session = await getAuthSession();
    const email = session?.user?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2) Strict same-origin check to reduce CSRF risk for cookie-based auth
    const forbidden = enforceSameOrigin(req);
    if (forbidden) return forbidden;

    const body = (await req.json().catch(() => null)) || {};

    // 3) Build the update from known fields only
    const update = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name || name.length > NAME_MAX) {
        return NextResponse.json(
          {
            success: false,
            error: `Display name must be 1–${NAME_MAX} characters.`,
          },
          { status: 400 }
        );
      }
      update.name = name;
    }

    if (typeof body.redditUsername === "string") {
      update.redditUsername = cleanUsername(
        body.redditUsername.trim().replace(/^\/?u\//i, "")
      );
    }
    const discordUsername = cleanUsername(body.discordUsername);
    if (discordUsername !== undefined) update.discordUsername = discordUsername;

    const boards = cleanList(body.boards);
    if (boards) update.boards = boards.filter((b) => BOARD_KEYS.has(b));

    // A subject is either AS or A Level, never both.
    const subjectsA2 = cleanList(body.subjectsA2);
    const subjectsAS = cleanList(body.subjectsAS);
    if (subjectsA2) update.subjectsA2 = subjectsA2;
    if (subjectsAS) {
      const inA2 = new Set(subjectsA2 ?? []);
      update.subjectsAS = subjectsAS.filter((key) => !inA2.has(key));
    }

    const examSession = cleanList(body.examSession);
    if (examSession) update.examSession = examSession;

    if (typeof body.receiveEmails === "boolean")
      update.receiveEmails = body.receiveEmails;

    // Study plans (scholarship matching)
    const nationalities = cleanList(body.nationalities);
    if (nationalities)
      update.nationalities = nationalities
        .filter(isCountryCode)
        .slice(0, MAX_NATIONALITIES);
    const studyDestinations = cleanList(body.studyDestinations);
    if (studyDestinations)
      update.studyDestinations = studyDestinations
        .filter(isCountryCode)
        .slice(0, MAX_DESTINATIONS);
    const intendedFields = cleanList(body.intendedFields);
    if (intendedFields)
      update.intendedFields = intendedFields.filter((f) => FIELD_KEYS.has(f));

    // 4) findOneAndUpdate and return the new document
    await connectDB();
    const updated = await UserData.findOneAndUpdate(
      { email },
      { $set: update },
      { new: true, upsert: false } // do not create new user here; handle signup elsewhere
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await invalidateUserCache(email);

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
