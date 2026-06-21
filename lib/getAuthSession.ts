import { ensureUserData } from "@/lib/ensureUserData";
import type { AuthSession } from "@/types/auth";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getAuthSession(): Promise<AuthSession | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const userData = await ensureUserData({
    email,
    name: user.fullName ?? user.firstName,
  });

  return {
    userId,
    user: {
      email,
      name: user.fullName ?? user.firstName ?? null,
      image: user.imageUrl ?? null,
    },
    userData: {
      id: userData._id.toString(),
      roles: (userData.roles ?? []) as AuthSession["userData"]["roles"],
      isOwner: Array.isArray(userData.roles)
        ? userData.roles.includes("owner")
        : false,
    },
  };
}
