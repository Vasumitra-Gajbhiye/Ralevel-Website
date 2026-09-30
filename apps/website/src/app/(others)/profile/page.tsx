import ProfileClient from "@/components/profile/ProfileClient";
import { getUserProfile, type UserProfile } from "@/lib/data/user-profile";
import { getAuthSession } from "@/lib/getAuthSession";
import { redirect } from "next/navigation";

export const metadata = { title: "Profile | r/alevel" };

export default async function ProfilePage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in?redirect_url=/profile");

  const { email, name, image } = session.user;
  const profile: UserProfile = (await getUserProfile()) ?? {
    name: "",
    email,
    redditUsername: "",
    discordUsername: "",
    boards: [],
    subjectsAS: [],
    subjectsA2: [],
    examSession: [],
    receiveEmails: false,
  };

  return (
    <ProfileClient
      profile={{ ...profile, email, name: profile.name.trim() || name || "" }}
      imageUrl={image}
    />
  );
}
