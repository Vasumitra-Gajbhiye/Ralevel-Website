import type { PaginationMeta } from "@/lib/pagination";
import { MAX_PAGE_SIZE } from "@/lib/pagination";

const roleOrder: Record<string, number> = {
  "Community Leader": 1,
  "Chief Administrator": 2,
  Administrator: 3,
  "Sr. Moderator": 4,
  "Jr. Moderator": 5,
};

function sortTeam(members: any[]) {
  return members.sort((a, b) => {
    const orderA = roleOrder[a.title] ?? 99;
    const orderB = roleOrder[b.title] ?? 99;
    return orderA - orderB;
  });
}

export default async function getAllTeam() {
  try {
    const apiLink = process.env.NEXT_PUBLIC_GETALLTEAM;
    if (!apiLink) return [];

    const allMembers: any[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const url = new URL(apiLink);
      url.searchParams.set("page", String(page));
      url.searchParams.set("limit", String(MAX_PAGE_SIZE));

      const res = await fetch(url.toString());
      const team = await res.json();

      if (!team?.data) break;

      allMembers.push(...team.data);
      hasNextPage = team.pagination?.hasNextPage ?? false;
      page += 1;
    }

    return sortTeam(allMembers);
  } catch (error) {
    console.log(error);
    return [];
  }
}
