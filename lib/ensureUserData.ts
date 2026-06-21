import connectDB from "@/lib/mongodb";
import { getPostHogClient } from "@/lib/posthog-server";
import type { Role } from "@/lib/roles";
import UserData from "@/models/userData";

type EnsureUserDataInput = {
  email: string;
  name?: string | null;
  trackSignIn?: boolean;
  provider?: string;
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
}: EnsureUserDataInput): Promise<UserDataDoc> {
  await connectDB();

  let existing = await UserData.findOne({ email }).lean<UserDataDoc>();
  const isNewUser = !existing;

  if (isNewUser) {
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

  return existing!;
}
