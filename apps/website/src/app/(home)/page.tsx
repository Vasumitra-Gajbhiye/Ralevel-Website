import { getCachedHomepageTeamMembers } from "@/lib/data/team";
import AboutUs from "./ui/about-us";
import Hero from "./ui/hero";
import JoinBanner from "./ui/join-banner.client";
import OurProgress from "./ui/our-progress";
import OurTeam from "./ui/our-team";

export default async function Home() {
  const homepageTeam = await getCachedHomepageTeamMembers();

  return (
    <main>
      <Hero />
      <AboutUs />
      <OurProgress />
      <OurTeam members={homepageTeam} />
      <JoinBanner />
    </main>
  );
}
