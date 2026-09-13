import { sanitizeRoles, type Role } from "@/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export type ClerkUserAuthMetadata = {
  roles: Role[];
  userDataId: string;
};

export async function syncClerkUserMetadata(
  clerkUserId: string,
  metadata: ClerkUserAuthMetadata
): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUser(clerkUserId, {
    publicMetadata: {
      roles: sanitizeRoles(metadata.roles),
      userDataId: metadata.userDataId,
    },
  });
}

export async function findClerkUserIdByEmail(
  email: string
): Promise<string | null> {
  const client = await clerkClient();
  const { data } = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  });

  return data[0]?.id ?? null;
}

export { sanitizeRoles };
