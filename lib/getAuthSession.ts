/**
 * Auth session is built from Clerk session claims / publicMetadata — not MongoDB.
 *
 * For best latency (single auth() call), customize the Clerk session token:
 * Sessions → Customize session token → add email, name, image_url, roles, userDataId
 * from user.public_metadata and user profile fields.
 */
import { ensureUserData } from "@/lib/ensureUserData";
import { sanitizeRoles } from "@/lib/syncClerkUserMetadata";
import type { Role } from "@/lib/roles";
import type { AuthSession } from "@/types/auth";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

type SessionClaims = Record<string, unknown> | null | undefined;

type ClerkPublicMetadata = {
  roles?: unknown;
  userDataId?: unknown;
};

function readClaimString(claims: SessionClaims, key: string): string | undefined {
  const value = claims?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readMetadata(
  claims: SessionClaims
): ClerkPublicMetadata | undefined {
  const metadata = claims?.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }
  return metadata as ClerkPublicMetadata;
}

function readRolesFromClaims(claims: SessionClaims): Role[] | undefined {
  const direct = sanitizeRoles(claims?.roles);
  if (direct.length > 0) return direct;

  const metadata = readMetadata(claims);
  const fromMetadata = sanitizeRoles(metadata?.roles);
  return fromMetadata.length > 0 ? fromMetadata : undefined;
}

function readUserDataIdFromClaims(claims: SessionClaims): string | undefined {
  const direct = readClaimString(claims, "userDataId");
  if (direct) return direct;

  const metadata = readMetadata(claims);
  return typeof metadata?.userDataId === "string" && metadata.userDataId.length > 0
    ? metadata.userDataId
    : undefined;
}

function readPublicMetadata(
  metadata: ClerkPublicMetadata | undefined
): { roles: Role[]; userDataId: string | undefined } {
  const roles = sanitizeRoles(metadata?.roles);
  const userDataId =
    typeof metadata?.userDataId === "string" && metadata.userDataId.length > 0
      ? metadata.userDataId
      : undefined;

  return { roles, userDataId };
}

export const getAuthSession = cache(async (): Promise<AuthSession | null> => {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;

  let email = readClaimString(sessionClaims, "email");
  let name = readClaimString(sessionClaims, "name") ?? null;
  let image = readClaimString(sessionClaims, "image_url") ?? null;
  let roles = readRolesFromClaims(sessionClaims);
  let userDataId = readUserDataIdFromClaims(sessionClaims);

  const needsClerkProfile =
    !email || roles === undefined || userDataId === undefined;

  if (needsClerkProfile) {
    const user = await currentUser();
    if (!user) return null;

    email = email ?? user.primaryEmailAddress?.emailAddress;
    name = name ?? user.fullName ?? user.firstName ?? null;
    image = image ?? user.imageUrl ?? null;

    const fromMetadata = readPublicMetadata(
      user.publicMetadata as ClerkPublicMetadata
    );

    if (roles === undefined) {
      roles = fromMetadata.roles;
    }
    if (userDataId === undefined) {
      userDataId = fromMetadata.userDataId;
    }
  }

  if (!email) return null;

  if (userDataId === undefined) {
    const userData = await ensureUserData({
      email,
      name,
      clerkUserId: userId,
    });

    roles = (userData.roles ?? []) as Role[];
    userDataId = userData._id.toString();
  }

  const resolvedRoles = roles ?? [];

  return {
    userId,
    user: {
      email,
      name,
      image,
    },
    userData: {
      id: userDataId,
      roles: resolvedRoles as AuthSession["userData"]["roles"],
      isOwner: resolvedRoles.includes("owner"),
    },
  };
});
