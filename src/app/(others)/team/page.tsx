import getAllTeam from "@/controller/getAllTeam";
import TeamClient from "./TeamClient";

export const revalidate = 300;

export default async function TeamPage() {
  const members = await getAllTeam();
  return <TeamClient members={members} />;
}
