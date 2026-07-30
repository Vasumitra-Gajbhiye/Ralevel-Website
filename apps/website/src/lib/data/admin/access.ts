import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import { ROLES, type Role } from "@/lib/roles";
import {
  applySuperAdminRoles,
  SUPER_ADMIN_EMAIL,
} from "@/lib/superAdmin";
import UserData from "@/models/userData";

export type AdminAccessUser = {
  name?: string;
  email: string;
  roles: Role[];
  nickname?: string;
  discordUserId?: string;
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

type GetAdminAccessListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getAdminAccessList({
  page,
  limit,
  skip,
}: GetAdminAccessListParams): Promise<PaginatedResult<AdminAccessUser>> {
  await connectDB();

  const [result] = await UserData.aggregate([
    {
      $match: {
        roles: { $exists: true, $not: { $size: 0 } },
      },
    },
    {
      $addFields: {
        roleRank: buildRoleRankSwitch(),
        sortPriority: {
          $cond: [
            {
              $eq: [{ $toLower: "$email" }, SUPER_ADMIN_EMAIL.toLowerCase()],
            },
            0,
            1,
          ],
        },
      },
    },
    {
      $sort: {
        sortPriority: 1,
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
              _id: 0,
              name: 1,
              email: 1,
              roles: 1,
              nickname: 1,
              discordUserId: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: AdminAccessUser[] = result.data.map((user: AdminAccessUser) => ({
    ...user,
    roles: applySuperAdminRoles(user.email, user.roles),
  }));

  return buildPaginatedResponse(data, total, page, limit);
}
