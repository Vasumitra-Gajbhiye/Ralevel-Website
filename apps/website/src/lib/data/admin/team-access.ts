import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import { ROLES, type Role } from "@/lib/roles";
import UserData from "@/models/userData";

export type TeamAccessUser<R extends Role = Role> = {
  name?: string;
  email: string;
  roles: Role[];
  teamRole: R | null;
};

function buildRoleRankSwitch() {
  return {
    $switch: {
      branches: ROLES.map((role, index) => ({
        case: { $in: [role, "$roles"] },
        then: index,
      })),
      default: ROLES.length,
    },
  };
}

/** Users holding any of `teamRoles`, highest authority first. */
export async function getTeamAccessList<R extends Role>(
  teamRoles: readonly R[],
  { page, limit, skip }: { page: number; limit: number; skip: number },
): Promise<PaginatedResult<TeamAccessUser<R>>> {
  await connectDB();

  const [result] = await UserData.aggregate([
    { $match: { roles: { $in: [...teamRoles] } } },
    {
      $addFields: {
        roleRank: buildRoleRankSwitch(),
        teamRole: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$roles",
                as: "role",
                cond: { $in: ["$$role", [...teamRoles]] },
              },
            },
            0,
          ],
        },
      },
    },
    { $sort: { roleRank: 1, email: 1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, name: 1, email: 1, roles: 1, teamRole: 1 } },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: TeamAccessUser<R>[] = result.data;

  return buildPaginatedResponse(data, total, page, limit);
}
