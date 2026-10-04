import { HubHeader } from "@/components/scholarships/HubTabs";
import TrackerList from "@/components/scholarships/TrackerList";
import { getSavedScholarships } from "@/lib/data/scholarship-saves";
import { getAuthSession } from "@/lib/getAuthSession";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Saved scholarships | r/alevel",
  robots: { index: false },
};

export default async function SavedScholarshipsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in?redirect_url=/scholarships/saved");

  const items = await getSavedScholarships(session.userData.id);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16 tracking-normal sm:px-8 sm:pt-20">
      <HubHeader
        title="Saved"
        subtitle="Track where you are with each application."
        active="saved"
        savedCount={items.length}
      />
      <div className="mt-10">
        <TrackerList initialItems={items} />
      </div>
    </div>
  );
}
