import { authorizeAdminApi } from "@/lib/adminApiAuth";
import { enforceSameOrigin } from "@/lib/csrf";
import { revalidateDataTags } from "@/lib/data-cache";
import {
  getCachedResourceSubjects,
  getResourcesHomepage,
  RESOURCES_HOMEPAGE_TAG,
} from "@/lib/data/resources-homepage";
import connectDB from "@/lib/mongodb";
import { RESOURCE_CMS_ROLES } from "@/lib/roles";
import ResourcesHomepage from "@/models/resourcesHomepage";
import type { FeaturedCard } from "@/types/resources2";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

const MAX_FEATURED = 20;
const MAX_POPULAR = 20;
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_BADGE_LENGTH = 20;

class ValidationError extends Error {}

function optionalString(value: unknown, field: string, max: number) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new ValidationError(`Invalid ${field}`);
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new ValidationError(`${field} must be ${max} characters or fewer`);
  }
  return trimmed || undefined;
}

function isAllowedHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parseFeatured(raw: unknown): FeaturedCard[] {
  if (!Array.isArray(raw)) throw new ValidationError("Invalid featured cards");
  if (raw.length > MAX_FEATURED) {
    throw new ValidationError(`At most ${MAX_FEATURED} featured cards`);
  }

  return raw.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new ValidationError(`Invalid card #${index + 1}`);
    }
    const card = item as Record<string, unknown>;
    const title = optionalString(card.title, "Title", MAX_TITLE_LENGTH);
    const href = optionalString(card.href, "Link", 2000);
    if (!title || !href) {
      throw new ValidationError(`Card #${index + 1} needs a title and link`);
    }
    if (!isAllowedHref(href)) {
      throw new ValidationError(
        `Card #${index + 1}: link must start with / or https://`,
      );
    }
    const image = optionalString(card.image, "Image", 500);
    if (image && !image.startsWith("/featured_thumb/")) {
      throw new ValidationError(`Card #${index + 1}: invalid image`);
    }

    const description = optionalString(
      card.description,
      "Description",
      MAX_DESCRIPTION_LENGTH,
    );
    const badge = optionalString(card.badge, "Badge", MAX_BADGE_LENGTH);

    return {
      title,
      href,
      ...(description && { description }),
      ...(image && { image }),
      ...(badge && { badge }),
    };
  });
}

async function parsePopularSlugs(raw: unknown): Promise<string[]> {
  if (!Array.isArray(raw)) throw new ValidationError("Invalid popular subjects");
  const slugs = Array.from(
    new Set(raw.filter((s): s is string => typeof s === "string")),
  );
  if (slugs.length > MAX_POPULAR) {
    throw new ValidationError(`At most ${MAX_POPULAR} popular subjects`);
  }

  const known = new Set((await getCachedResourceSubjects()).map((s) => s.slug));
  const unknown = slugs.filter((slug) => !known.has(slug));
  if (unknown.length > 0) {
    throw new ValidationError(`Unknown subject: ${unknown.join(", ")}`);
  }
  return slugs;
}

export async function GET(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
    rateLimit: { routeKey: "admin-resource-cms-homepage" },
  });
  if (auth instanceof Response) return auth;

  return NextResponse.json(await getResourcesHomepage());
}

export async function PUT(req: Request) {
  const auth = await authorizeAdminApi(req, {
    roles: [...RESOURCE_CMS_ROLES],
  });
  if (auth instanceof Response) return auth;

  const csrfError = enforceSameOrigin(req);
  if (csrfError) return csrfError;

  let featured: FeaturedCard[];
  let popularSlugs: string[];
  try {
    const body = await req.json();
    featured = parseFeatured(body?.featured);
    popularSlugs = await parsePopularSlugs(body?.popularSlugs);
  } catch (error) {
    const message =
      error instanceof ValidationError ? error.message : "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await connectDB();
  await ResourcesHomepage.updateOne(
    { key: "default" },
    {
      $set: {
        featured,
        popularSlugs,
        updatedBy: { userId: auth.userData.id, email: auth.user.email },
      },
    },
    { upsert: true },
  );

  revalidateDataTags(RESOURCES_HOMEPAGE_TAG);
  revalidatePath("/resources");

  return NextResponse.json({ featured, popularSlugs });
}
