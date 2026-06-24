import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import {
  RESOURCE_TEAM_ROLES,
  ROLES,
  type ResourceTeamRole,
  type Role,
} from "@/lib/roles";
import UserData from "@/models/userData";

export type ResourceAccessUser = {
  name?: string;
  email: string;
  roles: Role[];
  resourceRole: ResourceTeamRole | null;
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

type GetResourceAccessListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getResourceAccessList({
  page,
  limit,
  skip,
}: GetResourceAccessListParams): Promise<PaginatedResult<ResourceAccessUser>> {
  await connectDB();

  const [result] = await UserData.aggregate([
    {
      $match: {
        roles: { $in: [...RESOURCE_TEAM_ROLES] },
      },
    },
    {
      $addFields: {
        roleRank: buildRoleRankSwitch(),
        resourceRole: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$roles",
                as: "role",
                cond: { $in: ["$$role", [...RESOURCE_TEAM_ROLES]] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $sort: {
        roleRank: 1,
        email: 1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              email: 1,
              roles: 1,
              resourceRole: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: ResourceAccessUser[] = result.data;

  return buildPaginatedResponse(data, total, page, limit);
}
