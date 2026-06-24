import { getUserProfile } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const session = await getAuthSession();
  const initialProfile = session?.user?.email ? await getUserProfile() : null;

  return (
    <ProfileClient
      initialProfile={initialProfile}
      userImageUrl={session?.user?.image ?? null}
      userFullName={session?.user?.name ?? null}
    />
  );
}
