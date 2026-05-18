import connectDB from "@/lib/mongodb";
import { Campaign } from "@/models/Campaign";
import FundPageClient from "./FundPageClient";

export default async function Page() {
  await connectDB();

  // Fetch or initialize campaign data
  let campaign = await Campaign.findOne({ name: "minecraft-s2" });
  if (!campaign) {
    campaign = await Campaign.create({
      name: "minecraft-s2",
      raised: 0,
      goal: 1000,
    });
  }

  return (
    <FundPageClient
      initialRaised={campaign.raised}
      goal={campaign.goal}
      noContributors={campaign.noContributors}
    />
  );
}
