import { fetchUserDataByEmail } from "@/lib/data/user-data";
import connectDB from "@/lib/mongodb";
import { getPostHogClient } from "@/lib/posthog-server";
import type { Role } from "@/lib/roles";
import { syncClerkUserMetadata } from "@/lib/syncClerkUserMetadata";
import UserData from "@/models/userData";

type EnsureUserDataInput = {
  email: string;
  name?: string | null;
  trackSignIn?: boolean;
  provider?: string;
  clerkUserId?: string;
};

type UserDataDoc = {
  _id: { toString(): string };
  roles?: Role[];
  name?: string;
  email: string;
};

export async function ensureUserData({
  email,
  name,
  trackSignIn = false,
  provider = "google",
  clerkUserId,
}: EnsureUserDataInput): Promise<UserDataDoc> {
  let existing = (await fetchUserDataByEmail(email)) as UserDataDoc | null;
  const isNewUser = !existing;

  if (isNewUser) {
    await connectDB();
    const created = await UserData.create({
      name: name ?? "",
      email,
      roles: [],
      subjectsAS: [],
      subjectsA2: [],
      examSession: [],
      receiveEmails: false,
    });

    existing = {
      _id: created._id,
      roles: created.roles ?? [],
      name: created.name,
      email: created.email,
    };
  }

  if (trackSignIn || isNewUser) {
    const posthog = getPostHogClient();
    posthog.identify({
      distinctId: email,
      properties: {
        email,
        name: name ?? existing?.name ?? "",
      },
    });
    posthog.capture({
      distinctId: email,
      event: "user_signed_in",
      properties: {
        is_new_user: isNewUser,
        provider,
      },
    });
  }

  if (clerkUserId) {
    await syncClerkUserMetadata(clerkUserId, {
      roles: existing!.roles ?? [],
      userDataId: existing!._id.toString(),
    });
  }

  return existing!;
}
