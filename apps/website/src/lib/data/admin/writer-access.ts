import connectDB from "@/lib/mongodb";
import { buildPaginatedResponse, type PaginatedResult } from "@/lib/pagination";
import {
  ROLES,
  WRITER_TEAM_ROLES,
  type Role,
  type WriterTeamRole,
} from "@/lib/roles";
import UserData from "@/models/userData";

export type WriterAccessUser = {
  name?: string;
  email: string;
  roles: Role[];
  writerRole: WriterTeamRole | null;
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

type GetWriterAccessListParams = {
  page: number;
  limit: number;
  skip: number;
};

export async function getWriterAccessList({
  page,
  limit,
  skip,
}: GetWriterAccessListParams): Promise<PaginatedResult<WriterAccessUser>> {
  await connectDB();

  const [result] = await UserData.aggregate([
    {
      $match: {
        roles: { $in: [...WRITER_TEAM_ROLES] },
      },
    },
    {
      $addFields: {
        roleRank: buildRoleRankSwitch(),
        writerRole: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$roles",
                as: "role",
                cond: { $in: ["$$role", [...WRITER_TEAM_ROLES]] },
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
              _id: 0,
              name: 1,
              email: 1,
              roles: 1,
              writerRole: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = result.metadata[0]?.total ?? 0;
  const data: WriterAccessUser[] = result.data.map(
    (user: {
      name?: string;
      email: string;
      roles?: Role[];
      writerRole?: WriterTeamRole | null;
    }) => ({
      name: user.name,
      email: user.email,
      roles: [...(user.roles ?? [])],
      writerRole: user.writerRole ?? null,
    }),
  );

  return buildPaginatedResponse(data, total, page, limit);
}
