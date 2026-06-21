import Hero from "./ui/hero";
import AboutUs from "./ui/about-us";
import OurProgress from "./ui/our-progress";
import OurTeam from "./ui/our-team";
import JoinBanner from "./ui/join-banner.client";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <OurProgress />
      <OurTeam />
      <JoinBanner />
    </main>
  );
}
